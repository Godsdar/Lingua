"""Real statistical syntax and morphology, with exact source coordinates.

spaCy English dependencies are not Universal Dependencies. Preserve their labels.
No network call or model download is allowed during a request.
"""
from functools import lru_cache
import re
from threading import BoundedSemaphore

ENGINE_VERSION = '3.8.7'
MODEL_NAME = 'en_core_web_sm'
MODEL_VERSION = '3.8.0'
_CAPACITY = BoundedSemaphore(1)


class AnalysisError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        super().__init__(message)
        self.code = code
        self.status = status


def validate_text(text):
    if not isinstance(text, str):
        raise AnalysisError('INVALID_TEXT', 'Text must be a string.')
    try:
        length = len(text.encode('utf-16-le')) // 2
    except UnicodeEncodeError:
        raise AnalysisError('INVALID_TEXT', 'Text contains invalid Unicode.') from None
    if not text.strip() or length > 500 or len(re.findall(r"[^\W_]+(?:['’][^\W_]+)*", text)) > 50:
        raise AnalysisError('TEXT_LIMIT', 'Use one sentence, at most 500 UTF-16 units and 50 words.')


@lru_cache(maxsize=1)
def _model():
    import spacy
    if spacy.__version__ != ENGINE_VERSION:
        raise AnalysisError('ENGINE_UNAVAILABLE', 'The configured grammar engine is unavailable.', 503)
    model = spacy.load(MODEL_NAME, exclude=['ner'])
    if model.meta.get('version') != MODEL_VERSION:
        raise AnalysisError('ENGINE_UNAVAILABLE', 'The configured grammar model is unavailable.', 503)
    model.max_length = 1000
    return model


def validate_tokens(text: str, tokens: list):
    """Fail closed on corrupt offsets, disconnected heads, multiple roots or cycles."""
    if not tokens or len(tokens) > 500:
        raise AnalysisError('INVALID_PARSE', 'The engine returned an invalid analysis.', 502)
    source = text.encode('utf-16-le')
    roots = 0
    previous_end = 0
    for index, token in enumerate(tokens, start=1):
        start, end, head = token['start'], token['end'], token['head']
        if (token['id'] != index or type(head) is not int or not 0 <= head <= len(tokens)
                or head == index or type(start) is not int or type(end) is not int
                or not previous_end <= start < end <= len(source) // 2):
            raise AnalysisError('INVALID_PARSE', 'The engine returned an invalid analysis.', 502)
        try:
            original = source[start * 2:end * 2].decode('utf-16-le')
            gap = source[previous_end * 2:start * 2].decode('utf-16-le')
        except UnicodeDecodeError:
            raise AnalysisError('INVALID_PARSE', 'The engine returned invalid text ranges.', 502) from None
        if original != token['text'] or (gap and not gap.isspace()):
            raise AnalysisError('INVALID_PARSE', 'The engine returned invalid text ranges.', 502)
        roots += head == 0
        previous_end = end
    if roots != 1 or source[previous_end * 2:].decode('utf-16-le').strip():
        raise AnalysisError('INVALID_PARSE', 'The engine returned an invalid sentence tree.', 502)
    for token in tokens:
        seen = set()
        node = token['id']
        while node:
            if node in seen:
                raise AnalysisError('INVALID_PARSE', 'The engine returned a dependency cycle.', 502)
            seen.add(node)
            node = tokens[node - 1]['head']


def analyze(text: str) -> dict:
    validate_text(text)
    if not _CAPACITY.acquire(blocking=False):
        raise AnalysisError('BUSY', 'The grammar engine is busy. Try again shortly.', 503)
    try:
        doc = _model()(text)
        if sum(any(not token.is_space for token in sentence) for sentence in doc.sents) != 1:
            raise AnalysisError('MULTIPLE_SENTENCES', 'Select one sentence at a time.', 422)
        # spaCy indexes Unicode code points; browsers use UTF-16 code units.
        offsets = [0]
        for character in text:
            offsets.append(offsets[-1] + (2 if ord(character) > 0xFFFF else 1))
        lexical = [token for token in doc if not token.is_space]
        ids = {token.i: index + 1 for index, token in enumerate(lexical)}
        tokens = []
        for token in lexical:
            if token.head.i not in ids:
                raise AnalysisError('INVALID_PARSE', 'The engine returned an unsupported whitespace dependency.', 502)
            tokens.append({
                'id': ids[token.i], 'text': token.text,
                'start': offsets[token.idx], 'end': offsets[token.idx + len(token.text)],
                'lemma': token.lemma_, 'pos': token.pos_, 'tag': token.tag_,
                'features': token.morph.to_dict(),
                'head': 0 if token.head.i == token.i else ids[token.head.i],
                'relation': 'root' if token.dep_ == 'ROOT' else token.dep_,
            })
        validate_tokens(text, tokens)
        return {
            'tokens': tokens, 'engine': 'spaCy', 'version': ENGINE_VERSION,
            'model': MODEL_NAME, 'modelVersion': MODEL_VERSION,
            'dependencyScheme': 'spaCy English (OntoNotes-style)', 'license': 'MIT',
            'source': 'https://spacy.io/models/en#en_core_web_sm',
            'coordinateSystem': 'UTF-16, end-exclusive',
            'warnings': [
                'Statistical analysis can be wrong, especially for ambiguous sentences.',
                'Dependency labels follow spaCy English conventions, not Universal Dependencies.',
                'This model provides grammar and morphology, not semantic or etymological evidence.',
            ],
        }
    finally:
        _CAPACITY.release()
