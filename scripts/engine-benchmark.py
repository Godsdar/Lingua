"""Run from repository root: python -m scripts.engine-benchmark.
No network or private texts; latency is local and not a hosted SLO.
"""
import json
import platform
import resource
import statistics
import time

started = time.perf_counter()
from engine.analyzer import analyze
cold = analyze('My mother gives me water.')
cold_ms = (time.perf_counter() - started) * 1000
from engine.test_analyzer import CORPUS
samples = []
for text in CORPUS:
    start = time.perf_counter()
    result = analyze(text)
    samples.append({'text': text, 'milliseconds': round((time.perf_counter() - start) * 1000, 3), 'tokens': len(result['tokens'])})
print(json.dumps({
    'platform': platform.platform(), 'python': platform.python_version(),
    'engine': cold['engine'], 'version': cold['version'], 'model': cold['model'],
    'modelVersion': cold['modelVersion'], 'license': cold['license'],
    'coldMilliseconds': round(cold_ms, 3),
    'warmMedianMilliseconds': statistics.median(s['milliseconds'] for s in samples),
    'maxRssBytes': resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1 if platform.system() == 'Darwin' else 1024),
    'validSamples': len(samples), 'samples': samples,
}, indent=2))
