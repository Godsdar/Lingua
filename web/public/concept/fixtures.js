/* Handcrafted sentence analyses and source-checked word families; see docs/CONCEPT.md. */
window.LINGUA_CONCEPT_DATA = {
  "sentences": {
    "examples": [
      {
        "id": "mother-water",
        "text": "My mother gives me water.",
        "translation": "Моя мама даёт мне воду.",
        "explanation": "Handcrafted demo: a simple present statement. “My mother” is the subject; “gives” is the main verb; “me” is the recipient; “water” is what she gives.",
        "tokens": [
          {
            "text": "My",
            "start": 0,
            "end": 2,
            "lemma": "my",
            "pos": "PRON",
            "features": {
              "Poss": "Yes",
              "PronType": "Prs",
              "Person": "1"
            },
            "head": 2,
            "relation": "nmod:poss",
            "explanation": "A possessive determiner: it tells us whose mother."
          },
          {
            "text": "mother",
            "start": 3,
            "end": 9,
            "lemma": "mother",
            "pos": "NOUN",
            "features": {
              "Number": "Sing"
            },
            "head": 3,
            "relation": "nsubj",
            "explanation": "The subject: the person who gives the water."
          },
          {
            "text": "gives",
            "start": 10,
            "end": 15,
            "lemma": "give",
            "pos": "VERB",
            "features": {
              "Tense": "Pres",
              "VerbForm": "Fin",
              "Person": "3",
              "Number": "Sing",
              "Mood": "Ind"
            },
            "head": 0,
            "relation": "root",
            "explanation": "The main verb. The -s agrees with the singular third-person subject."
          },
          {
            "text": "me",
            "start": 16,
            "end": 18,
            "lemma": "I",
            "pos": "PRON",
            "features": {
              "Case": "Acc",
              "Person": "1",
              "Number": "Sing",
              "PronType": "Prs"
            },
            "head": 3,
            "relation": "iobj",
            "explanation": "The recipient, expressed as an indirect object."
          },
          {
            "text": "water",
            "start": 19,
            "end": 24,
            "lemma": "water",
            "pos": "NOUN",
            "features": {
              "Number": "Sing"
            },
            "head": 3,
            "relation": "obj",
            "explanation": "The direct object: what is given. Water is used here as a mass noun."
          },
          {
            "text": ".",
            "start": 24,
            "end": 25,
            "lemma": ".",
            "pos": "PUNCT",
            "features": {},
            "head": 3,
            "relation": "punct",
            "explanation": "Ends the statement."
          }
        ],
        "phrases": []
      },
      {
        "id": "present-perfect-progressive",
        "text": "She has been reading the book.",
        "translation": "Она уже некоторое время читает книгу.",
        "explanation": "Handcrafted demo: the present perfect progressive connects an ongoing activity with the present. Without more context, the activity may still be continuing or may have stopped recently. The Russian translation is one possible reading.",
        "tokens": [
          {
            "text": "She",
            "start": 0,
            "end": 3,
            "lemma": "she",
            "pos": "PRON",
            "features": {
              "Case": "Nom",
              "Gender": "Fem",
              "Number": "Sing",
              "Person": "3",
              "PronType": "Prs"
            },
            "head": 4,
            "relation": "nsubj",
            "explanation": "The subject of reading."
          },
          {
            "text": "has",
            "start": 4,
            "end": 7,
            "lemma": "have",
            "pos": "AUX",
            "features": {
              "Tense": "Pres",
              "VerbForm": "Fin",
              "Person": "3",
              "Number": "Sing",
              "Mood": "Ind"
            },
            "head": 4,
            "relation": "aux",
            "explanation": "The finite auxiliary: marks present tense and agrees with she."
          },
          {
            "text": "been",
            "start": 8,
            "end": 12,
            "lemma": "be",
            "pos": "AUX",
            "features": {
              "Tense": "Past",
              "VerbForm": "Part"
            },
            "head": 4,
            "relation": "aux",
            "explanation": "The participle of be after have; combines with reading to express the progressive."
          },
          {
            "text": "reading",
            "start": 13,
            "end": 20,
            "lemma": "read",
            "pos": "VERB",
            "features": {
              "VerbForm": "Part",
              "Tense": "Pres"
            },
            "head": 0,
            "relation": "root",
            "explanation": "The lexical verb and syntactic head of the verb group."
          },
          {
            "text": "the",
            "start": 21,
            "end": 24,
            "lemma": "the",
            "pos": "DET",
            "features": {
              "Definite": "Def",
              "PronType": "Art"
            },
            "head": 6,
            "relation": "det",
            "explanation": "Marks the book as identifiable in the context."
          },
          {
            "text": "book",
            "start": 25,
            "end": 29,
            "lemma": "book",
            "pos": "NOUN",
            "features": {
              "Number": "Sing"
            },
            "head": 4,
            "relation": "obj",
            "explanation": "The direct object: what she is reading."
          },
          {
            "text": ".",
            "start": 29,
            "end": 30,
            "lemma": ".",
            "pos": "PUNCT",
            "features": {},
            "head": 4,
            "relation": "punct",
            "explanation": "Ends the statement."
          }
        ],
        "phrases": [
          {
            "text": "has been reading",
            "start": 4,
            "end": 20,
            "explanation": "Handcrafted demo: have in the present + been + an -ing participle forms the present perfect progressive. It foregrounds the activity over a period leading up to now; the exact duration and whether it has stopped depend on context."
          }
        ]
      },
      {
        "id": "relative-clause",
        "text": "The book that I bought yesterday is fascinating.",
        "translation": "Книга, которую я купил вчера, очень интересная.",
        "explanation": "Handcrafted demo: “The book” is the subject of the main clause. “That I bought yesterday” identifies the book through a relative clause. “Is fascinating” describes it. This fixture treats fascinating as a predicative adjective; other tagging schemes may analyse it differently.",
        "tokens": [
          {
            "text": "The",
            "start": 0,
            "end": 3,
            "lemma": "the",
            "pos": "DET",
            "features": {
              "Definite": "Def",
              "PronType": "Art"
            },
            "head": 2,
            "relation": "det",
            "explanation": "Introduces the identifiable book."
          },
          {
            "text": "book",
            "start": 4,
            "end": 8,
            "lemma": "book",
            "pos": "NOUN",
            "features": {
              "Number": "Sing"
            },
            "head": 8,
            "relation": "nsubj",
            "explanation": "The subject of the main clause; also the noun modified by the relative clause."
          },
          {
            "text": "that",
            "start": 9,
            "end": 13,
            "lemma": "that",
            "pos": "PRON",
            "features": {
              "PronType": "Rel"
            },
            "head": 5,
            "relation": "obj",
            "explanation": "A relative pronoun standing for the book; it is the object of bought inside the relative clause."
          },
          {
            "text": "I",
            "start": 14,
            "end": 15,
            "lemma": "I",
            "pos": "PRON",
            "features": {
              "Case": "Nom",
              "Person": "1",
              "Number": "Sing",
              "PronType": "Prs"
            },
            "head": 5,
            "relation": "nsubj",
            "explanation": "The subject of bought in the relative clause."
          },
          {
            "text": "bought",
            "start": 16,
            "end": 22,
            "lemma": "buy",
            "pos": "VERB",
            "features": {
              "Tense": "Past",
              "VerbForm": "Fin",
              "Mood": "Ind"
            },
            "head": 2,
            "relation": "acl:relcl",
            "explanation": "The verb of the relative clause, which modifies book."
          },
          {
            "text": "yesterday",
            "start": 23,
            "end": 32,
            "lemma": "yesterday",
            "pos": "ADV",
            "features": {},
            "head": 5,
            "relation": "advmod",
            "explanation": "Says when the buying happened."
          },
          {
            "text": "is",
            "start": 33,
            "end": 35,
            "lemma": "be",
            "pos": "AUX",
            "features": {
              "Tense": "Pres",
              "VerbForm": "Fin",
              "Person": "3",
              "Number": "Sing",
              "Mood": "Ind"
            },
            "head": 8,
            "relation": "cop",
            "explanation": "A copula linking the subject to its description."
          },
          {
            "text": "fascinating",
            "start": 36,
            "end": 47,
            "lemma": "fascinating",
            "pos": "ADJ",
            "features": {
              "Degree": "Pos"
            },
            "head": 0,
            "relation": "root",
            "explanation": "The predicate adjective: it describes the book as very interesting."
          },
          {
            "text": ".",
            "start": 47,
            "end": 48,
            "lemma": ".",
            "pos": "PUNCT",
            "features": {},
            "head": 8,
            "relation": "punct",
            "explanation": "Ends the statement."
          }
        ],
        "phrases": [
          {
            "text": "that I bought yesterday",
            "start": 9,
            "end": 32,
            "explanation": "Handcrafted demo: a restrictive relative clause modifies book. I is its subject, bought its verb, that its object referring back to book, and yesterday a time modifier."
          }
        ]
      }
    ]
  },
  "families": {
    "water": {
      "nodes": [
        {
          "id": "w-pie",
          "label": "*wódr̥",
          "lang": "Proto-Indo-European",
          "gloss": "water",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/w%C3%B3dr%CC%A5",
          "parent": null,
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/w%C3%B3dr%CC%A5"
        },
        {
          "id": "w-germ",
          "label": "*watōr",
          "lang": "Proto-Germanic",
          "gloss": "water",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/wat%C5%8Dr",
          "parent": "w-pie",
          "condensed": true,
          "skipped": [
            "PIE collective *wédōr; pre-Proto-Germanic developments"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/wat%C5%8Dr"
        },
        {
          "id": "w-west",
          "label": "*watar",
          "lang": "Proto-West Germanic",
          "gloss": "water",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar",
          "parent": "w-germ",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar"
        },
        {
          "id": "w-oe",
          "label": "wæter",
          "lang": "Old English",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/w%C3%A6ter#Old_English",
          "parent": "w-west",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar#Descendants"
        },
        {
          "id": "w-en",
          "label": "water",
          "lang": "English",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/water#English",
          "parent": "w-oe",
          "condensed": true,
          "skipped": [
            "Middle English water"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar#Descendants"
        },
        {
          "id": "w-de",
          "label": "Wasser",
          "lang": "German",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/Wasser#German",
          "parent": "w-west",
          "condensed": true,
          "skipped": [
            "Old High German waȥȥar",
            "Middle High German waȥȥer"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar#Descendants"
        },
        {
          "id": "w-nl",
          "label": "water",
          "lang": "Dutch",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/water#Dutch",
          "parent": "w-west",
          "condensed": true,
          "skipped": [
            "Old Dutch watar / water",
            "Middle Dutch wāter"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar#Descendants"
        },
        {
          "id": "w-on",
          "label": "vatn",
          "lang": "Old Norse",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/vatn#Old_Norse",
          "parent": "w-germ",
          "condensed": true,
          "skipped": [
            "Earlier North Germanic developments not shown"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/wat%C5%8Dr#Descendants"
        },
        {
          "id": "w-sv",
          "label": "vatten",
          "lang": "Swedish",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/vatten#Swedish",
          "parent": "w-on",
          "condensed": true,
          "skipped": [
            "Old Swedish vatn"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/wat%C5%8Dr#Descendants"
        },
        {
          "id": "w-bs",
          "label": "*wandō",
          "lang": "Proto-Balto-Slavic",
          "gloss": "water",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/wand%C5%8D",
          "parent": "w-pie",
          "condensed": true,
          "skipped": [
            "PIE collective *wédōr; n-extension"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/wand%C5%8D"
        },
        {
          "id": "w-sl",
          "label": "*vodà",
          "lang": "Proto-Slavic",
          "gloss": "water",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/voda",
          "parent": "w-bs",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/voda"
        },
        {
          "id": "w-ru",
          "label": "вода́",
          "lang": "Russian",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/%D0%B2%D0%BE%D0%B4%D0%B0#Russian",
          "parent": "w-sl",
          "condensed": true,
          "skipped": [
            "Old East Slavic вода"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/voda#Descendants"
        },
        {
          "id": "w-pl",
          "label": "woda",
          "lang": "Polish",
          "gloss": "water",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/woda#Polish",
          "parent": "w-sl",
          "condensed": true,
          "skipped": [
            "Old Polish woda"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/voda#Descendants"
        }
      ],
      "note": "Curated, source-checked prototype data, not a live dictionary result. Six present-day cognates. Parent links denote a selected historical descent path, not necessarily a direct one-generation change. condensed=true marks omitted stages; skipped describes them. PIE *wódr̥ is used as a family headword: Germanic and Balto-Slavic derive through its collective *wédōr, not by an unexplained direct sound change. Asterisks mark unattested reconstructed forms, not disputed relationships. Node source links to the term; edgeSource links to the consulted source supporting the relation. Revisions consulted online on 2026-10-11.",
      "sources": [
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/w%C3%B3dr%CC%A5",
          "revision": 92151890
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/wat%C5%8Dr",
          "revision": 92171140
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/watar",
          "revision": 92183543
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/wand%C5%8D",
          "revision": 92145437
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/voda",
          "revision": 89975601
        }
      ],
      "attribution": "English Wiktionary contributors, CC BY-SA 4.0",
      "verifiedOn": "2026-10-11"
    },
    "mother": {
      "nodes": [
        {
          "id": "m-pie",
          "label": "*méh₂tēr",
          "lang": "Proto-Indo-European",
          "gloss": "mother",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/m%C3%A9h%E2%82%82t%C4%93r",
          "parent": null,
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/m%C3%A9h%E2%82%82t%C4%93r"
        },
        {
          "id": "m-germ",
          "label": "*mōdēr",
          "lang": "Proto-Germanic",
          "gloss": "mother",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r",
          "parent": "m-pie",
          "condensed": true,
          "skipped": [
            "Suffix-stressed PIE variant *meh₂tḗr"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r"
        },
        {
          "id": "m-west",
          "label": "*mōder",
          "lang": "Proto-West Germanic",
          "gloss": "mother",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/m%C5%8Dder",
          "parent": "m-germ",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-oe",
          "label": "mōdor",
          "lang": "Old English",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/modor#Old_English",
          "parent": "m-west",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-en",
          "label": "mother",
          "lang": "English",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/mother#English",
          "parent": "m-oe",
          "condensed": true,
          "skipped": [
            "Middle English moder"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-de",
          "label": "Mutter",
          "lang": "German",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/Mutter#German",
          "parent": "m-west",
          "condensed": true,
          "skipped": [
            "Old High German muoter",
            "Middle High German muoter"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-nl",
          "label": "moeder",
          "lang": "Dutch",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/moeder#Dutch",
          "parent": "m-west",
          "condensed": true,
          "skipped": [
            "Old Dutch muoder",
            "Middle Dutch moeder"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-on",
          "label": "móðir",
          "lang": "Old Norse",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/m%C3%B3%C3%B0ir#Old_Norse",
          "parent": "m-germ",
          "condensed": true,
          "skipped": [
            "Earlier North Germanic developments not shown"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-sv",
          "label": "moder",
          "lang": "Swedish",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/moder#Swedish",
          "parent": "m-on",
          "condensed": true,
          "skipped": [
            "Old Swedish mōþir"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r#Descendants"
        },
        {
          "id": "m-bs",
          "label": "*mā́ˀtē",
          "lang": "Proto-Balto-Slavic",
          "gloss": "mother",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/m%C4%81%CC%81%CB%80t%C4%93",
          "parent": "m-pie",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/m%C4%81%CC%81%CB%80t%C4%93"
        },
        {
          "id": "m-sl",
          "label": "*màti",
          "lang": "Proto-Slavic",
          "gloss": "mother",
          "reconstructed": true,
          "source": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/mati",
          "parent": "m-bs",
          "condensed": false,
          "skipped": [],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/mati"
        },
        {
          "id": "m-ru",
          "label": "мать",
          "lang": "Russian",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D1%82%D1%8C#Russian",
          "parent": "m-sl",
          "condensed": true,
          "skipped": [
            "Old East Slavic мати"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/mati#Descendants"
        },
        {
          "id": "m-uk",
          "label": "ма́ти",
          "lang": "Ukrainian",
          "gloss": "mother",
          "reconstructed": false,
          "source": "https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D1%82%D0%B8#Ukrainian",
          "parent": "m-sl",
          "condensed": true,
          "skipped": [
            "Old East Slavic мати",
            "Old Ruthenian ма́ти"
          ],
          "edgeSource": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/mati#Descendants"
        }
      ],
      "note": "Curated, source-checked prototype data, not a live dictionary result. Six present-day cognates. parent may stand for a condensed lineage, with omitted stages listed in skipped. The conventional PIE headword *méh₂tēr has alternative accent reconstructions; Proto-Germanic is explained through suffix-stressed *meh₂tḗr. Swedish moder is chosen rather than treating every nursery form meaning mother as a cognate. Ukrainian мати is included instead of Polish matka, whose derivation would require a separate derived-form model. Node source links to the term; edgeSource links to consulted source evidence.",
      "sources": [
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/m%C3%A9h%E2%82%82t%C4%93r",
          "revision": 92171553
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Germanic/m%C5%8Dd%C4%93r",
          "revision": 92367468
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-West_Germanic/m%C5%8Dder"
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Balto-Slavic/m%C4%81%CC%81%CB%80t%C4%93",
          "revision": 92145377
        },
        {
          "url": "https://en.wiktionary.org/wiki/Reconstruction:Proto-Slavic/mati",
          "revision": 93038246
        }
      ],
      "attribution": "English Wiktionary contributors, CC BY-SA 4.0",
      "verifiedOn": "2026-10-11"
    }
  }
};
