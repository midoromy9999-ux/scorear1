window.ScorearMotionData = {
  "version": 3,
  "moves": {
    "idle": "وقوف",
    "walkForward": "مشي نحوك",
    "walkBackward": "مشي بعيدًا عنك",
    "walkRight": "مشي يمينًا",
    "walkLeft": "مشي يسارًا",
    "runRight": "جري يمينًا",
    "runLeft": "جري يسارًا",
    "jump": "قفز",
    "land": "هبوط",
    "clap": "تصفيق",
    "win": "احتفال الفوز",
    "sad": "حزن",
    "wave": "تلويح",
    "fly": "طيران",
    "climb": "تسلّق"
  },
  "events": {
    "lobby": "idle",
    "enter": "walkForward",
    "rush": "runRight",
    "correct": "clap",
    "incorrect": "sad",
    "podium": "jump",
    "winner": "win",
    "land": "land",
    "greet": "wave",
    "takeFlight": "fly",
    "climb": "climb"
  },
  "images": {
    "first-trio": {
      "file": "atlases/first-trio.png",
      "width": 692,
      "height": 1149
    },
    "first-run": {
      "file": "atlases/first-run.png",
      "width": 1024,
      "height": 1260
    },
    "first-jump": {
      "file": "atlases/first-jump.png",
      "width": 764,
      "height": 1228
    },
    "first-emotion": {
      "file": "atlases/first-emotion.png",
      "width": 856,
      "height": 1276
    },
    "second-walk": {
      "file": "atlases/second-walk.png",
      "width": 935,
      "height": 1340
    },
    "second-run": {
      "file": "atlases/second-run.png",
      "width": 1145,
      "height": 1335
    },
    "second-jump": {
      "file": "atlases/second-jump.png",
      "width": 1075,
      "height": 1300
    },
    "second-emotion": {
      "file": "atlases/second-emotion.png",
      "width": 960,
      "height": 1360
    },
    "second-clap": {
      "file": "atlases/second-clap.png",
      "width": 805,
      "height": 1345
    },
    "third-a-travel": {
      "file": "atlases/third-a-travel.png",
      "width": 1170,
      "height": 1240
    },
    "third-a-jump": {
      "file": "atlases/third-a-jump.png",
      "width": 1205,
      "height": 1204
    },
    "third-a-reactions": {
      "file": "atlases/third-a-reactions.png",
      "width": 1272,
      "height": 1362
    },
    "third-b-travel": {
      "file": "atlases/third-b-travel.png",
      "width": 1062,
      "height": 1230
    },
    "third-b-jump": {
      "file": "atlases/third-b-jump.png",
      "width": 1210,
      "height": 1144
    },
    "third-b-reactions": {
      "file": "atlases/third-b-reactions.png",
      "width": 1164,
      "height": 1338
    },
    "nour-clap-0": {
      "file": "atlases/nour-clap-0.png",
      "width": 256,
      "height": 700
    },
    "nour-clap-1": {
      "file": "atlases/nour-clap-1.png",
      "width": 263,
      "height": 700
    },
    "nour-clap-2": {
      "file": "atlases/nour-clap-2.png",
      "width": 247,
      "height": 700
    },
    "nour-clap-3": {
      "file": "atlases/nour-clap-3.png",
      "width": 252,
      "height": 700
    },
    "g1-direction": {
      "file": "atlases/g1-direction.png",
      "width": 774,
      "height": 1235
    },
    "g1-special": {
      "file": "atlases/g1-special.png",
      "width": 1470,
      "height": 1240
    },
    "g2-direction": {
      "file": "atlases/g2-direction.png",
      "width": 810,
      "height": 1240
    },
    "g2-special": {
      "file": "atlases/g2-special.png",
      "width": 1536,
      "height": 1265
    },
    "g3-direction": {
      "file": "atlases/g3-direction.png",
      "width": 1116,
      "height": 1230
    },
    "g3-special": {
      "file": "atlases/g3-special.png",
      "width": 1410,
      "height": 1215
    },
    "g4-direction": {
      "file": "atlases/g4-direction.png",
      "width": 1134,
      "height": 1255
    },
    "g4-special": {
      "file": "atlases/g4-special.png",
      "width": 1380,
      "height": 1195
    },
    "first-side": {
      "file": "atlases/first-side.png",
      "width": 916,
      "height": 1288
    }
  },
  "characters": {
    "char_01": {
      "id": 1,
      "name": "زياد",
      "original": "originals/char_01.png",
      "originalFilename": "01_Ziyad_زياد.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                0,
                107,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 33.5,
                "ay": 234,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                0,
                107,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 45.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                0,
                106,
                237
              ],
              "ms": 142,
              "layout": {
                "ax": 58.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                0,
                107,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 45.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                0,
                234,
                312
              ],
              "ms": 105,
              "layout": {
                "ax": 100.5,
                "ay": 310,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                0,
                159,
                259
              ],
              "ms": 85,
              "layout": {
                "ax": 77,
                "ay": 316,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                0,
                256,
                305
              ],
              "ms": 105,
              "layout": {
                "ax": 111.5,
                "ay": 306,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                0,
                152,
                258
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 315,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                0,
                0,
                173,
                272
              ],
              "ms": 180,
              "layout": {
                "ax": 76.5,
                "ay": 269,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.013651877133105802,
                "halfWidth": 0.3293515358361775
              }
            },
            {
              "image": "first-jump",
              "rect": [
                191,
                0,
                177,
                307
              ],
              "ms": 100,
              "layout": {
                "ax": 86,
                "ay": 305,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.013651877133105802,
                "halfWidth": 0.3293515358361775
              }
            },
            {
              "image": "first-jump",
              "rect": [
                382,
                0,
                177,
                280
              ],
              "ms": 215,
              "layout": {
                "ax": 91.5,
                "ay": 326,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.013651877133105802,
                "halfWidth": 0.3293515358361775
              }
            },
            {
              "image": "first-jump",
              "rect": [
                573,
                0,
                172,
                276
              ],
              "ms": 160,
              "layout": {
                "ax": 84.5,
                "ay": 272,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.013651877133105802,
                "halfWidth": 0.3293515358361775
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                0,
                136,
                317
              ],
              "ms": 1000,
              "layout": {
                "ax": 69,
                "ay": 309,
                "unit": 303,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.23391812865497075
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                0,
                136,
                317
              ],
              "ms": 95,
              "layout": {
                "ax": 69,
                "ay": 309,
                "unit": 303,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.3102310231023102
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                214,
                0,
                182,
                317
              ],
              "ms": 1050,
              "layout": {
                "ax": 94,
                "ay": 309,
                "unit": 303,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.3102310231023102
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                0,
                136,
                317
              ],
              "ms": 120,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 303,
                "above": 1.0396039603960396,
                "below": 0.006600660066006601,
                "halfWidth": 0.22937293729372937
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                428,
                0,
                131,
                313
              ],
              "ms": 1100,
              "layout": {
                "ax": 69.5,
                "ay": 311,
                "unit": 303,
                "above": 1.0396039603960396,
                "below": 0.006600660066006601,
                "halfWidth": 0.22937293729372937
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                0,
                136,
                317
              ],
              "ms": 120,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 303,
                "above": 1.0396039603960396,
                "below": 0.006600660066006601,
                "halfWidth": 0.2524752475247525
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                642,
                0,
                152,
                317
              ],
              "ms": 1100,
              "layout": {
                "ax": 76.5,
                "ay": 315,
                "unit": 303,
                "above": 1.0396039603960396,
                "below": 0.006600660066006601,
                "halfWidth": 0.2524752475247525
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "first-trio",
              "rect": [
                0,
                0,
                150,
                356
              ],
              "ms": 160,
              "layout": {
                "ax": 76,
                "ay": 348,
                "unit": 342,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.23391812865497075
              }
            },
            {
              "image": "first-trio",
              "rect": [
                173,
                0,
                158,
                356
              ],
              "ms": 135,
              "layout": {
                "ax": 78,
                "ay": 348,
                "unit": 342,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.23391812865497075
              }
            },
            {
              "image": "first-trio",
              "rect": [
                346,
                0,
                133,
                356
              ],
              "ms": 100,
              "layout": {
                "ax": 66,
                "ay": 348,
                "unit": 342,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.23391812865497075
              }
            },
            {
              "image": "first-trio",
              "rect": [
                519,
                0,
                148,
                356
              ],
              "ms": 145,
              "layout": {
                "ax": 73,
                "ay": 348,
                "unit": 342,
                "above": 1.0198019801980198,
                "below": 0.026402640264026403,
                "halfWidth": 0.23391812865497075
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                0,
                107,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 33.5,
                "ay": 234,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                0,
                107,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 45.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                0,
                106,
                237
              ],
              "ms": 142,
              "layout": {
                "ax": 58.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                0,
                107,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 45.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0446428571428572,
                "below": 0.017857142857142856,
                "halfWidth": 0.328125
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                387,
                0,
                106,
                237
              ],
              "ms": 142,
              "layout": {
                "ax": 52.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0493273542600896,
                "below": 0.013452914798206279,
                "halfWidth": 0.33856502242152464
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                0,
                105,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 61.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0493273542600896,
                "below": 0.013452914798206279,
                "halfWidth": 0.33856502242152464
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                645,
                0,
                107,
                237
              ],
              "ms": 142,
              "layout": {
                "ax": 75.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0493273542600896,
                "below": 0.013452914798206279,
                "halfWidth": 0.33856502242152464
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                0,
                105,
                236
              ],
              "ms": 116,
              "layout": {
                "ax": 61.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0493273542600896,
                "below": 0.013452914798206279,
                "halfWidth": 0.33856502242152464
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                0,
                217,
                321
              ],
              "ms": 145,
              "layout": {
                "ax": 94.5,
                "ay": 315,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                0,
                128,
                322
              ],
              "ms": 135,
              "layout": {
                "ax": 68,
                "ay": 317,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                0,
                210,
                322
              ],
              "ms": 145,
              "layout": {
                "ax": 100.5,
                "ay": 316,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                0,
                122,
                319
              ],
              "ms": 135,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                0,
                217,
                321
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 94.5,
                "ay": 315,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                0,
                128,
                322
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 68,
                "ay": 317,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                0,
                210,
                322
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 100.5,
                "ay": 316,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                0,
                122,
                319
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 308,
                "above": 1.0292207792207793,
                "below": 0.01948051948051948,
                "halfWidth": 0.3977272727272727
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                0,
                234,
                312
              ],
              "ms": 105,
              "layout": {
                "ax": 100.5,
                "ay": 310,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                0,
                159,
                259
              ],
              "ms": 85,
              "layout": {
                "ax": 77,
                "ay": 316,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                0,
                256,
                305
              ],
              "ms": 105,
              "layout": {
                "ax": 111.5,
                "ay": 306,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                0,
                152,
                258
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 315,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                0,
                234,
                312
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 100.5,
                "ay": 310,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                0,
                159,
                259
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 77,
                "ay": 316,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                0,
                256,
                305
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 111.5,
                "ay": 306,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                0,
                152,
                258
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 315,
                "unit": 298,
                "above": 1.0604026845637584,
                "below": 0.006711409395973154,
                "halfWidth": 0.4848993288590604
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                573,
                0,
                172,
                276
              ],
              "ms": 230,
              "layout": {
                "ax": 84.5,
                "ay": 272,
                "unit": 262,
                "above": 1.0381679389312977,
                "below": 0.015267175572519083,
                "halfWidth": 0.33396946564885494
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                0,
                0,
                202,
                216
              ],
              "ms": 165,
              "layout": {
                "ax": 83.5,
                "ay": 225,
                "unit": 202,
                "above": 1.113861386138614,
                "below": 0,
                "halfWidth": 0.8044554455445545
              }
            },
            {
              "image": "g1-special",
              "rect": [
                245,
                0,
                219,
                211
              ],
              "ms": 165,
              "layout": {
                "ax": 77.5,
                "ay": 222,
                "unit": 202,
                "above": 1.113861386138614,
                "below": 0,
                "halfWidth": 0.8044554455445545
              }
            },
            {
              "image": "g1-special",
              "rect": [
                490,
                0,
                240,
                201
              ],
              "ms": 165,
              "layout": {
                "ax": 77.5,
                "ay": 219,
                "unit": 202,
                "above": 1.113861386138614,
                "below": 0,
                "halfWidth": 0.8044554455445545
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                735,
                0,
                162,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 34.5,
                "ay": 227,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.5448717948717948
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                0,
                143,
                244
              ],
              "ms": 160,
              "layout": {
                "ax": 39.5,
                "ay": 230,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.5448717948717948
              }
            },
            {
              "image": "g1-special",
              "rect": [
                1225,
                0,
                142,
                248
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.5448717948717948
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                0,
                143,
                244
              ],
              "ms": 160,
              "layout": {
                "ax": 39.5,
                "ay": 230,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.5448717948717948
              }
            }
          ]
        }
      }
    },
    "char_02": {
      "id": 2,
      "name": "نور",
      "original": "originals/char_02.png",
      "originalFilename": "02_Nour_نور.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                247,
                113,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 37.5,
                "ay": 235,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                247,
                109,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 44.5,
                "ay": 234,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                247,
                109,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 57.5,
                "ay": 235,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                247,
                109,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 44.5,
                "ay": 234,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                315,
                214,
                303
              ],
              "ms": 105,
              "layout": {
                "ax": 93.5,
                "ay": 305,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                315,
                176,
                257
              ],
              "ms": 85,
              "layout": {
                "ax": 78,
                "ay": 313,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                315,
                228,
                296
              ],
              "ms": 105,
              "layout": {
                "ax": 92.5,
                "ay": 300,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                315,
                174,
                245
              ],
              "ms": 85,
              "layout": {
                "ax": 74.5,
                "ay": 309,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                0,
                307,
                172,
                265
              ],
              "ms": 180,
              "layout": {
                "ax": 77.5,
                "ay": 264,
                "unit": 286,
                "above": 1.1013986013986015,
                "below": 0.0034965034965034965,
                "halfWidth": 0.3304195804195804
              }
            },
            {
              "image": "first-jump",
              "rect": [
                191,
                307,
                175,
                300
              ],
              "ms": 100,
              "layout": {
                "ax": 83,
                "ay": 299,
                "unit": 286,
                "above": 1.1013986013986015,
                "below": 0.0034965034965034965,
                "halfWidth": 0.3304195804195804
              }
            },
            {
              "image": "first-jump",
              "rect": [
                382,
                307,
                170,
                281
              ],
              "ms": 215,
              "layout": {
                "ax": 84.5,
                "ay": 315,
                "unit": 286,
                "above": 1.1013986013986015,
                "below": 0.0034965034965034965,
                "halfWidth": 0.3304195804195804
              }
            },
            {
              "image": "first-jump",
              "rect": [
                573,
                307,
                173,
                271
              ],
              "ms": 160,
              "layout": {
                "ax": 90.5,
                "ay": 270,
                "unit": 286,
                "above": 1.1013986013986015,
                "below": 0.0034965034965034965,
                "halfWidth": 0.3304195804195804
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                319,
                136,
                311
              ],
              "ms": 1000,
              "layout": {
                "ax": 69,
                "ay": 303,
                "unit": 297,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                319,
                136,
                311
              ],
              "ms": 95,
              "layout": {
                "ax": 69,
                "ay": 303,
                "unit": 297,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.29194630872483224
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                214,
                319,
                170,
                312
              ],
              "ms": 1050,
              "layout": {
                "ax": 83,
                "ay": 304,
                "unit": 298,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.29194630872483224
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                319,
                136,
                311
              ],
              "ms": 120,
              "layout": {
                "ax": 64.5,
                "ay": 313,
                "unit": 297,
                "above": 1.0538720538720538,
                "below": 0,
                "halfWidth": 0.24074074074074073
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                428,
                319,
                123,
                306
              ],
              "ms": 1100,
              "layout": {
                "ax": 71.5,
                "ay": 309,
                "unit": 297,
                "above": 1.0538720538720538,
                "below": 0,
                "halfWidth": 0.24074074074074073
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                319,
                136,
                311
              ],
              "ms": 120,
              "layout": {
                "ax": 64.5,
                "ay": 313,
                "unit": 300,
                "above": 1.0533333333333332,
                "below": 0,
                "halfWidth": 0.24833333333333332
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                642,
                319,
                145,
                314
              ],
              "ms": 1100,
              "layout": {
                "ax": 74.5,
                "ay": 316,
                "unit": 300,
                "above": 1.0533333333333332,
                "below": 0,
                "halfWidth": 0.24833333333333332
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "nour-clap-0",
              "rect": [
                0,
                0,
                256,
                700
              ],
              "ms": 160,
              "layout": {
                "ax": 130,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-1",
              "rect": [
                0,
                0,
                263,
                700
              ],
              "ms": 115,
              "layout": {
                "ax": 143,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-3",
              "rect": [
                0,
                0,
                252,
                700
              ],
              "ms": 65,
              "layout": {
                "ax": 130,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-2",
              "rect": [
                0,
                0,
                247,
                700
              ],
              "ms": 80,
              "layout": {
                "ax": 131,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-3",
              "rect": [
                0,
                0,
                252,
                700
              ],
              "ms": 110,
              "layout": {
                "ax": 130,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-1",
              "rect": [
                0,
                0,
                263,
                700
              ],
              "ms": 125,
              "layout": {
                "ax": 143,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            },
            {
              "image": "nour-clap-0",
              "rect": [
                0,
                0,
                256,
                700
              ],
              "ms": 120,
              "layout": {
                "ax": 130,
                "ay": 692,
                "unit": 686,
                "above": 1.02020202020202,
                "below": 0.026936026936026935,
                "halfWidth": 0.23232323232323232
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                247,
                113,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 37.5,
                "ay": 235,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                247,
                109,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 44.5,
                "ay": 234,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                247,
                109,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 57.5,
                "ay": 235,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                247,
                109,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 44.5,
                "ay": 234,
                "unit": 219,
                "above": 1.0730593607305936,
                "below": 0,
                "halfWidth": 0.3447488584474886
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                387,
                247,
                108,
                231
              ],
              "ms": 142,
              "layout": {
                "ax": 53.5,
                "ay": 234,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.3387096774193548
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                247,
                102,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 61.5,
                "ay": 234,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.3387096774193548
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                645,
                247,
                107,
                231
              ],
              "ms": 142,
              "layout": {
                "ax": 73.5,
                "ay": 234,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.3387096774193548
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                247,
                102,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 61.5,
                "ay": 234,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.3387096774193548
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                322,
                223,
                312
              ],
              "ms": 145,
              "layout": {
                "ax": 100.5,
                "ay": 313,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                322,
                142,
                311
              ],
              "ms": 135,
              "layout": {
                "ax": 83,
                "ay": 312,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                322,
                216,
                310
              ],
              "ms": 145,
              "layout": {
                "ax": 107.5,
                "ay": 311,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                322,
                141,
                311
              ],
              "ms": 135,
              "layout": {
                "ax": 86.5,
                "ay": 313,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                322,
                223,
                312
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 100.5,
                "ay": 313,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                322,
                142,
                311
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 83,
                "ay": 312,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                322,
                216,
                310
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 107.5,
                "ay": 311,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                322,
                141,
                311
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 86.5,
                "ay": 313,
                "unit": 298,
                "above": 1.0503355704697988,
                "below": 0,
                "halfWidth": 0.4110738255033557
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                315,
                214,
                303
              ],
              "ms": 105,
              "layout": {
                "ax": 93.5,
                "ay": 305,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                315,
                176,
                257
              ],
              "ms": 85,
              "layout": {
                "ax": 78,
                "ay": 313,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                315,
                228,
                296
              ],
              "ms": 105,
              "layout": {
                "ax": 92.5,
                "ay": 300,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                315,
                174,
                245
              ],
              "ms": 85,
              "layout": {
                "ax": 74.5,
                "ay": 309,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                315,
                214,
                303
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 93.5,
                "ay": 305,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                315,
                176,
                257
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 78,
                "ay": 313,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                315,
                228,
                296
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 92.5,
                "ay": 300,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                315,
                174,
                245
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 74.5,
                "ay": 309,
                "unit": 289,
                "above": 1.0830449826989619,
                "below": 0,
                "halfWidth": 0.4688581314878893
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                573,
                307,
                173,
                271
              ],
              "ms": 230,
              "layout": {
                "ax": 90.5,
                "ay": 270,
                "unit": 257,
                "above": 1.0505836575875487,
                "below": 0.0038910505836575876,
                "halfWidth": 0.3521400778210117
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                0,
                248,
                203,
                218
              ],
              "ms": 165,
              "layout": {
                "ax": 81.5,
                "ay": 225,
                "unit": 204,
                "above": 1.1029411764705883,
                "below": 0,
                "halfWidth": 0.7916666666666666
              }
            },
            {
              "image": "g1-special",
              "rect": [
                245,
                248,
                214,
                216
              ],
              "ms": 165,
              "layout": {
                "ax": 71.5,
                "ay": 225,
                "unit": 204,
                "above": 1.1029411764705883,
                "below": 0,
                "halfWidth": 0.7916666666666666
              }
            },
            {
              "image": "g1-special",
              "rect": [
                490,
                248,
                237,
                209
              ],
              "ms": 165,
              "layout": {
                "ax": 75.5,
                "ay": 225,
                "unit": 204,
                "above": 1.1029411764705883,
                "below": 0,
                "halfWidth": 0.7916666666666666
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                735,
                248,
                167,
                238
              ],
              "ms": 160,
              "layout": {
                "ax": 33.5,
                "ay": 224,
                "unit": 227,
                "above": 1,
                "below": 0.06167400881057269,
                "halfWidth": 0.5881057268722467
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                248,
                158,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 38.5,
                "ay": 227,
                "unit": 227,
                "above": 1,
                "below": 0.06167400881057269,
                "halfWidth": 0.5881057268722467
              }
            },
            {
              "image": "g1-special",
              "rect": [
                1225,
                248,
                153,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 227,
                "unit": 227,
                "above": 1,
                "below": 0.06167400881057269,
                "halfWidth": 0.5881057268722467
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                248,
                158,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 38.5,
                "ay": 227,
                "unit": 227,
                "above": 1,
                "below": 0.06167400881057269,
                "halfWidth": 0.5881057268722467
              }
            }
          ]
        }
      }
    },
    "char_03": {
      "id": 3,
      "name": "سليم",
      "original": "originals/char_03.png",
      "originalFilename": "03_Salim_سليم.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                494,
                104,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 30.5,
                "ay": 242,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                494,
                100,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 40.5,
                "ay": 241,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                494,
                102,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 54.5,
                "ay": 242,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                494,
                100,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 40.5,
                "ay": 241,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                630,
                238,
                313
              ],
              "ms": 105,
              "layout": {
                "ax": 111.5,
                "ay": 312,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                630,
                174,
                259
              ],
              "ms": 85,
              "layout": {
                "ax": 86,
                "ay": 317,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                630,
                253,
                309
              ],
              "ms": 105,
              "layout": {
                "ax": 114.5,
                "ay": 308,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                630,
                156,
                266
              ],
              "ms": 85,
              "layout": {
                "ax": 70.5,
                "ay": 314,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                0,
                614,
                175,
                270
              ],
              "ms": 180,
              "layout": {
                "ax": 77.5,
                "ay": 267,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.010238907849829351,
                "halfWidth": 0.33276450511945393
              }
            },
            {
              "image": "first-jump",
              "rect": [
                191,
                614,
                179,
                307
              ],
              "ms": 100,
              "layout": {
                "ax": 91,
                "ay": 305,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.010238907849829351,
                "halfWidth": 0.33276450511945393
              }
            },
            {
              "image": "first-jump",
              "rect": [
                382,
                614,
                174,
                283
              ],
              "ms": 215,
              "layout": {
                "ax": 92.5,
                "ay": 326,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.010238907849829351,
                "halfWidth": 0.33276450511945393
              }
            },
            {
              "image": "first-jump",
              "rect": [
                573,
                614,
                172,
                274
              ],
              "ms": 160,
              "layout": {
                "ax": 83.5,
                "ay": 271,
                "unit": 293,
                "above": 1.1126279863481228,
                "below": 0.010238907849829351,
                "halfWidth": 0.33276450511945393
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                638,
                136,
                319
              ],
              "ms": 1000,
              "layout": {
                "ax": 70,
                "ay": 311,
                "unit": 305,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.22950819672131148
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                638,
                136,
                319
              ],
              "ms": 95,
              "layout": {
                "ax": 70,
                "ay": 311,
                "unit": 305,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.28524590163934427
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                214,
                638,
                174,
                319
              ],
              "ms": 1050,
              "layout": {
                "ax": 87,
                "ay": 311,
                "unit": 305,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.28524590163934427
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                638,
                136,
                319
              ],
              "ms": 120,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 305,
                "above": 1.0327868852459017,
                "below": 0.013114754098360656,
                "halfWidth": 0.24754098360655738
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                428,
                638,
                131,
                313
              ],
              "ms": 1100,
              "layout": {
                "ax": 75.5,
                "ay": 309,
                "unit": 305,
                "above": 1.0327868852459017,
                "below": 0.013114754098360656,
                "halfWidth": 0.24754098360655738
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                638,
                136,
                319
              ],
              "ms": 120,
              "layout": {
                "ax": 68.5,
                "ay": 315,
                "unit": 305,
                "above": 1.0327868852459017,
                "below": 0.013114754098360656,
                "halfWidth": 0.27377049180327867
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                642,
                638,
                154,
                319
              ],
              "ms": 1100,
              "layout": {
                "ax": 83.5,
                "ay": 315,
                "unit": 305,
                "above": 1.0327868852459017,
                "below": 0.013114754098360656,
                "halfWidth": 0.27377049180327867
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "first-trio",
              "rect": [
                0,
                383,
                153,
                383
              ],
              "ms": 160,
              "layout": {
                "ax": 80,
                "ay": 375,
                "unit": 369,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.22950819672131148
              }
            },
            {
              "image": "first-trio",
              "rect": [
                173,
                383,
                161,
                382
              ],
              "ms": 135,
              "layout": {
                "ax": 81,
                "ay": 374,
                "unit": 368,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.22950819672131148
              }
            },
            {
              "image": "first-trio",
              "rect": [
                346,
                383,
                143,
                382
              ],
              "ms": 100,
              "layout": {
                "ax": 72,
                "ay": 374,
                "unit": 368,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.22950819672131148
              }
            },
            {
              "image": "first-trio",
              "rect": [
                519,
                383,
                155,
                382
              ],
              "ms": 145,
              "layout": {
                "ax": 81,
                "ay": 374,
                "unit": 368,
                "above": 1.019672131147541,
                "below": 0.02622950819672131,
                "halfWidth": 0.22950819672131148
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                494,
                104,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 30.5,
                "ay": 242,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                494,
                100,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 40.5,
                "ay": 241,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                494,
                102,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 54.5,
                "ay": 242,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                494,
                100,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 40.5,
                "ay": 241,
                "unit": 222,
                "above": 1.09009009009009,
                "below": 0,
                "halfWidth": 0.3310810810810811
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                387,
                494,
                100,
                235
              ],
              "ms": 142,
              "layout": {
                "ax": 48.5,
                "ay": 242,
                "unit": 221,
                "above": 1.0950226244343892,
                "below": 0,
                "halfWidth": 0.3235294117647059
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                494,
                96,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 57.5,
                "ay": 242,
                "unit": 221,
                "above": 1.0950226244343892,
                "below": 0,
                "halfWidth": 0.3235294117647059
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                645,
                494,
                99,
                235
              ],
              "ms": 142,
              "layout": {
                "ax": 71.5,
                "ay": 242,
                "unit": 221,
                "above": 1.0950226244343892,
                "below": 0,
                "halfWidth": 0.3235294117647059
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                494,
                96,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 57.5,
                "ay": 242,
                "unit": 221,
                "above": 1.0950226244343892,
                "below": 0,
                "halfWidth": 0.3235294117647059
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                644,
                219,
                317
              ],
              "ms": 145,
              "layout": {
                "ax": 95.5,
                "ay": 317,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                644,
                110,
                315
              ],
              "ms": 135,
              "layout": {
                "ax": 59,
                "ay": 317,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                644,
                212,
                319
              ],
              "ms": 145,
              "layout": {
                "ax": 98.5,
                "ay": 319,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                644,
                117,
                315
              ],
              "ms": 135,
              "layout": {
                "ax": 64.5,
                "ay": 316,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                644,
                219,
                317
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 95.5,
                "ay": 317,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                644,
                110,
                315
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 59,
                "ay": 317,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                644,
                212,
                319
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 319,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                644,
                117,
                315
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 64.5,
                "ay": 316,
                "unit": 305,
                "above": 1.0459016393442624,
                "below": 0,
                "halfWidth": 0.40491803278688526
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                630,
                238,
                313
              ],
              "ms": 105,
              "layout": {
                "ax": 111.5,
                "ay": 312,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                630,
                174,
                259
              ],
              "ms": 85,
              "layout": {
                "ax": 86,
                "ay": 317,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                630,
                253,
                309
              ],
              "ms": 105,
              "layout": {
                "ax": 114.5,
                "ay": 308,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                630,
                156,
                266
              ],
              "ms": 85,
              "layout": {
                "ax": 70.5,
                "ay": 314,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                630,
                238,
                313
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 111.5,
                "ay": 312,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                630,
                174,
                259
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 86,
                "ay": 317,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                630,
                253,
                309
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 114.5,
                "ay": 308,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                630,
                156,
                266
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 70.5,
                "ay": 314,
                "unit": 299,
                "above": 1.060200668896321,
                "below": 0.0033444816053511705,
                "halfWidth": 0.46321070234113715
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                573,
                614,
                172,
                274
              ],
              "ms": 230,
              "layout": {
                "ax": 83.5,
                "ay": 271,
                "unit": 260,
                "above": 1.0423076923076924,
                "below": 0.011538461538461539,
                "halfWidth": 0.3403846153846154
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                0,
                496,
                204,
                221
              ],
              "ms": 165,
              "layout": {
                "ax": 81.5,
                "ay": 230,
                "unit": 207,
                "above": 1.1111111111111112,
                "below": 0,
                "halfWidth": 0.7995169082125604
              }
            },
            {
              "image": "g1-special",
              "rect": [
                245,
                496,
                218,
                214
              ],
              "ms": 165,
              "layout": {
                "ax": 70.5,
                "ay": 228,
                "unit": 207,
                "above": 1.1111111111111112,
                "below": 0,
                "halfWidth": 0.7995169082125604
              }
            },
            {
              "image": "g1-special",
              "rect": [
                490,
                496,
                245,
                212
              ],
              "ms": 165,
              "layout": {
                "ax": 79.5,
                "ay": 228,
                "unit": 207,
                "above": 1.1111111111111112,
                "below": 0,
                "halfWidth": 0.7995169082125604
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                735,
                496,
                166,
                245
              ],
              "ms": 160,
              "layout": {
                "ax": 33.5,
                "ay": 229,
                "unit": 233,
                "above": 0.9914163090128756,
                "below": 0.06866952789699571,
                "halfWidth": 0.5686695278969958
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                496,
                141,
                246
              ],
              "ms": 160,
              "layout": {
                "ax": 40.5,
                "ay": 230,
                "unit": 233,
                "above": 0.9914163090128756,
                "below": 0.06866952789699571,
                "halfWidth": 0.5686695278969958
              }
            },
            {
              "image": "g1-special",
              "rect": [
                1225,
                496,
                141,
                247
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 231,
                "unit": 233,
                "above": 0.9914163090128756,
                "below": 0.06866952789699571,
                "halfWidth": 0.5686695278969958
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                496,
                141,
                246
              ],
              "ms": 160,
              "layout": {
                "ax": 40.5,
                "ay": 230,
                "unit": 233,
                "above": 0.9914163090128756,
                "below": 0.06866952789699571,
                "halfWidth": 0.5686695278969958
              }
            }
          ]
        }
      }
    },
    "char_04": {
      "id": 4,
      "name": "فريدة",
      "original": "originals/char_04.png",
      "originalFilename": "04_Farida_فريدة.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                741,
                129,
                241
              ],
              "ms": 142,
              "layout": {
                "ax": 42.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                741,
                120,
                240
              ],
              "ms": 116,
              "layout": {
                "ax": 43.5,
                "ay": 245,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                741,
                120,
                241
              ],
              "ms": 142,
              "layout": {
                "ax": 55.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                741,
                120,
                240
              ],
              "ms": 116,
              "layout": {
                "ax": 43.5,
                "ay": 245,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                945,
                239,
                315
              ],
              "ms": 105,
              "layout": {
                "ax": 108.5,
                "ay": 317,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                945,
                179,
                269
              ],
              "ms": 85,
              "layout": {
                "ax": 80,
                "ay": 320,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                945,
                239,
                309
              ],
              "ms": 105,
              "layout": {
                "ax": 101.5,
                "ay": 312,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                945,
                175,
                268
              ],
              "ms": 85,
              "layout": {
                "ax": 74.5,
                "ay": 319,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                0,
                921,
                182,
                280
              ],
              "ms": 180,
              "layout": {
                "ax": 70.5,
                "ay": 277,
                "unit": 292,
                "above": 1.0924657534246576,
                "below": 0.010273972602739725,
                "halfWidth": 0.3818493150684932
              }
            },
            {
              "image": "first-jump",
              "rect": [
                191,
                921,
                186,
                306
              ],
              "ms": 100,
              "layout": {
                "ax": 80,
                "ay": 304,
                "unit": 292,
                "above": 1.0924657534246576,
                "below": 0.010273972602739725,
                "halfWidth": 0.3818493150684932
              }
            },
            {
              "image": "first-jump",
              "rect": [
                382,
                921,
                191,
                287
              ],
              "ms": 215,
              "layout": {
                "ax": 90.5,
                "ay": 319,
                "unit": 292,
                "above": 1.0924657534246576,
                "below": 0.010273972602739725,
                "halfWidth": 0.3818493150684932
              }
            },
            {
              "image": "first-jump",
              "rect": [
                573,
                921,
                181,
                283
              ],
              "ms": 160,
              "layout": {
                "ax": 80.5,
                "ay": 281,
                "unit": 292,
                "above": 1.0924657534246576,
                "below": 0.010273972602739725,
                "halfWidth": 0.3818493150684932
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                957,
                176,
                315
              ],
              "ms": 1000,
              "layout": {
                "ax": 84,
                "ay": 307,
                "unit": 301,
                "above": 1.0199335548172757,
                "below": 0.026578073089700997,
                "halfWidth": 0.30564784053156147
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                957,
                176,
                315
              ],
              "ms": 95,
              "layout": {
                "ax": 84,
                "ay": 307,
                "unit": 301,
                "above": 1.020066889632107,
                "below": 0.026755852842809364,
                "halfWidth": 0.3745819397993311
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                214,
                957,
                214,
                313
              ],
              "ms": 1050,
              "layout": {
                "ax": 102,
                "ay": 305,
                "unit": 299,
                "above": 1.020066889632107,
                "below": 0.026755852842809364,
                "halfWidth": 0.3745819397993311
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                957,
                176,
                315
              ],
              "ms": 120,
              "layout": {
                "ax": 79.5,
                "ay": 316,
                "unit": 302,
                "above": 1.0496688741721854,
                "below": 0,
                "halfWidth": 0.3195364238410596
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                428,
                957,
                159,
                316
              ],
              "ms": 1100,
              "layout": {
                "ax": 75.5,
                "ay": 317,
                "unit": 302,
                "above": 1.0496688741721854,
                "below": 0,
                "halfWidth": 0.3195364238410596
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "first-emotion",
              "rect": [
                0,
                957,
                176,
                315
              ],
              "ms": 120,
              "layout": {
                "ax": 79.5,
                "ay": 316,
                "unit": 301,
                "above": 1.0498338870431894,
                "below": 0,
                "halfWidth": 0.32059800664451826
              }
            },
            {
              "image": "first-emotion",
              "rect": [
                642,
                957,
                179,
                315
              ],
              "ms": 1100,
              "layout": {
                "ax": 82.5,
                "ay": 316,
                "unit": 301,
                "above": 1.0498338870431894,
                "below": 0,
                "halfWidth": 0.32059800664451826
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "first-trio",
              "rect": [
                0,
                766,
                173,
                336
              ],
              "ms": 160,
              "layout": {
                "ax": 83,
                "ay": 328,
                "unit": 322,
                "above": 1.0199335548172757,
                "below": 0.026578073089700997,
                "halfWidth": 0.30564784053156147
              }
            },
            {
              "image": "first-trio",
              "rect": [
                173,
                766,
                169,
                336
              ],
              "ms": 135,
              "layout": {
                "ax": 83,
                "ay": 328,
                "unit": 322,
                "above": 1.0199335548172757,
                "below": 0.026578073089700997,
                "halfWidth": 0.30564784053156147
              }
            },
            {
              "image": "first-trio",
              "rect": [
                346,
                766,
                165,
                336
              ],
              "ms": 100,
              "layout": {
                "ax": 81,
                "ay": 328,
                "unit": 322,
                "above": 1.0199335548172757,
                "below": 0.026578073089700997,
                "halfWidth": 0.30564784053156147
              }
            },
            {
              "image": "first-trio",
              "rect": [
                519,
                766,
                167,
                337
              ],
              "ms": 145,
              "layout": {
                "ax": 81,
                "ay": 329,
                "unit": 323,
                "above": 1.0199335548172757,
                "below": 0.026578073089700997,
                "halfWidth": 0.30564784053156147
              }
            }
          ],
          "label": "احتفال بالفرشاة"
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                741,
                129,
                241
              ],
              "ms": 142,
              "layout": {
                "ax": 42.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                741,
                120,
                240
              ],
              "ms": 116,
              "layout": {
                "ax": 43.5,
                "ay": 245,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                741,
                120,
                241
              ],
              "ms": 142,
              "layout": {
                "ax": 55.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                741,
                120,
                240
              ],
              "ms": 116,
              "layout": {
                "ax": 43.5,
                "ay": 245,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                387,
                741,
                123,
                241
              ],
              "ms": 142,
              "layout": {
                "ax": 63.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                741,
                118,
                241
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                645,
                741,
                127,
                240
              ],
              "ms": 142,
              "layout": {
                "ax": 86.5,
                "ay": 245,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                741,
                118,
                241
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.381057268722467
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                966,
                229,
                319
              ],
              "ms": 145,
              "layout": {
                "ax": 104.5,
                "ay": 316,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                966,
                144,
                320
              ],
              "ms": 135,
              "layout": {
                "ax": 69,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                966,
                224,
                320
              ],
              "ms": 145,
              "layout": {
                "ax": 108.5,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                966,
                143,
                320
              ],
              "ms": 135,
              "layout": {
                "ax": 74.5,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-side",
              "rect": [
                0,
                966,
                229,
                319
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 104.5,
                "ay": 316,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                229,
                966,
                144,
                320
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 69,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                458,
                966,
                224,
                320
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 108.5,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            },
            {
              "image": "first-side",
              "rect": [
                687,
                966,
                143,
                320
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 74.5,
                "ay": 317,
                "unit": 306,
                "above": 1.0359477124183007,
                "below": 0.00980392156862745,
                "halfWidth": 0.4068627450980392
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                945,
                239,
                315
              ],
              "ms": 105,
              "layout": {
                "ax": 108.5,
                "ay": 317,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                945,
                179,
                269
              ],
              "ms": 85,
              "layout": {
                "ax": 80,
                "ay": 320,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                945,
                239,
                309
              ],
              "ms": 105,
              "layout": {
                "ax": 101.5,
                "ay": 312,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                945,
                175,
                268
              ],
              "ms": 85,
              "layout": {
                "ax": 74.5,
                "ay": 319,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "first-run",
              "rect": [
                0,
                945,
                239,
                315
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 108.5,
                "ay": 317,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                256,
                945,
                179,
                269
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 80,
                "ay": 320,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                512,
                945,
                239,
                309
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 101.5,
                "ay": 312,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            },
            {
              "image": "first-run",
              "rect": [
                768,
                945,
                175,
                268
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 74.5,
                "ay": 319,
                "unit": 301,
                "above": 1.06312292358804,
                "below": 0,
                "halfWidth": 0.4568106312292359
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "first-jump",
              "rect": [
                573,
                921,
                181,
                283
              ],
              "ms": 230,
              "layout": {
                "ax": 80.5,
                "ay": 281,
                "unit": 269,
                "above": 1.0446096654275092,
                "below": 0.007434944237918215,
                "halfWidth": 0.3736059479553903
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                0,
                744,
                208,
                219
              ],
              "ms": 165,
              "layout": {
                "ax": 85.5,
                "ay": 227,
                "unit": 205,
                "above": 1.1073170731707318,
                "below": 0,
                "halfWidth": 0.8219512195121951
              }
            },
            {
              "image": "g1-special",
              "rect": [
                245,
                744,
                225,
                215
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 227,
                "unit": 205,
                "above": 1.1073170731707318,
                "below": 0,
                "halfWidth": 0.8219512195121951
              }
            },
            {
              "image": "g1-special",
              "rect": [
                490,
                744,
                245,
                207
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 226,
                "unit": 205,
                "above": 1.1073170731707318,
                "below": 0,
                "halfWidth": 0.8219512195121951
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                735,
                744,
                158,
                239
              ],
              "ms": 160,
              "layout": {
                "ax": 30.5,
                "ay": 224,
                "unit": 233,
                "above": 0.9957081545064378,
                "below": 0.06437768240343347,
                "halfWidth": 0.5472103004291845
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                744,
                137,
                242
              ],
              "ms": 160,
              "layout": {
                "ax": 37.5,
                "ay": 227,
                "unit": 233,
                "above": 0.9957081545064378,
                "below": 0.06437768240343347,
                "halfWidth": 0.5472103004291845
              }
            },
            {
              "image": "g1-special",
              "rect": [
                1225,
                744,
                139,
                247
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 232,
                "unit": 233,
                "above": 0.9957081545064378,
                "below": 0.06437768240343347,
                "halfWidth": 0.5472103004291845
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                744,
                137,
                242
              ],
              "ms": 160,
              "layout": {
                "ax": 37.5,
                "ay": 227,
                "unit": 233,
                "above": 0.9957081545064378,
                "below": 0.06437768240343347,
                "halfWidth": 0.5472103004291845
              }
            }
          ]
        }
      }
    },
    "char_05": {
      "id": 5,
      "name": "ياسين",
      "original": "originals/char_05.png",
      "originalFilename": "05_Yaseen_ياسين.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                988,
                115,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 38.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                988,
                111,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 46.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                988,
                112,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 59.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                988,
                111,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 46.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                0,
                209,
                265
              ],
              "ms": 105,
              "layout": {
                "ax": 99,
                "ay": 258,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                0,
                179,
                213
              ],
              "ms": 85,
              "layout": {
                "ax": 85,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                0,
                218,
                262
              ],
              "ms": 105,
              "layout": {
                "ax": 106,
                "ay": 257,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                0,
                177,
                208
              ],
              "ms": 85,
              "layout": {
                "ax": 83,
                "ay": 259,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                0,
                0,
                157,
                207
              ],
              "ms": 180,
              "layout": {
                "ax": 72,
                "ay": 201,
                "unit": 240,
                "above": 1.075,
                "below": 0.025,
                "halfWidth": 0.42083333333333334
              }
            },
            {
              "image": "second-jump",
              "rect": [
                215,
                0,
                175,
                254
              ],
              "ms": 100,
              "layout": {
                "ax": 91,
                "ay": 248,
                "unit": 240,
                "above": 1.075,
                "below": 0.025,
                "halfWidth": 0.42083333333333334
              }
            },
            {
              "image": "second-jump",
              "rect": [
                430,
                0,
                202,
                228
              ],
              "ms": 215,
              "layout": {
                "ax": 101,
                "ay": 258,
                "unit": 240,
                "above": 1.075,
                "below": 0.025,
                "halfWidth": 0.42083333333333334
              }
            },
            {
              "image": "second-jump",
              "rect": [
                645,
                0,
                168,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 78,
                "ay": 214,
                "unit": 240,
                "above": 1.075,
                "below": 0.025,
                "halfWidth": 0.42083333333333334
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                0,
                116,
                268
              ],
              "ms": 1000,
              "layout": {
                "ax": 58,
                "ay": 260,
                "unit": 254,
                "above": 1.0241935483870968,
                "below": 0.03225806451612903,
                "halfWidth": 0.24899598393574296
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                0,
                116,
                268
              ],
              "ms": 95,
              "layout": {
                "ax": 58,
                "ay": 260,
                "unit": 254,
                "above": 1.0273972602739727,
                "below": 0.0365296803652968,
                "halfWidth": 0.4292237442922374
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                192,
                0,
                157,
                233
              ],
              "ms": 1050,
              "layout": {
                "ax": 63,
                "ay": 225,
                "unit": 219,
                "above": 1.0273972602739727,
                "below": 0.0365296803652968,
                "halfWidth": 0.4292237442922374
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                0,
                116,
                268
              ],
              "ms": 120,
              "layout": {
                "ax": 31,
                "ay": 259,
                "unit": 254,
                "above": 1.0196850393700787,
                "below": 0.03543307086614173,
                "halfWidth": 0.3346456692913386
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                384,
                0,
                102,
                259
              ],
              "ms": 1100,
              "layout": {
                "ax": 62,
                "ay": 250,
                "unit": 254,
                "above": 1.0196850393700787,
                "below": 0.03543307086614173,
                "halfWidth": 0.3346456692913386
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                0,
                116,
                268
              ],
              "ms": 120,
              "layout": {
                "ax": 31,
                "ay": 259,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.4117647058823529
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                576,
                0,
                142,
                269
              ],
              "ms": 1100,
              "layout": {
                "ax": 105,
                "ay": 260,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.4117647058823529
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                0,
                0,
                115,
                262
              ],
              "ms": 160,
              "layout": {
                "ax": 56,
                "ay": 254,
                "unit": 248,
                "above": 1.0241935483870968,
                "below": 0.03225806451612903,
                "halfWidth": 0.24899598393574296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                161,
                0,
                119,
                263
              ],
              "ms": 135,
              "layout": {
                "ax": 57,
                "ay": 255,
                "unit": 249,
                "above": 1.0241935483870968,
                "below": 0.03225806451612903,
                "halfWidth": 0.24899598393574296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                322,
                0,
                107,
                263
              ],
              "ms": 100,
              "layout": {
                "ax": 53,
                "ay": 255,
                "unit": 249,
                "above": 1.0241935483870968,
                "below": 0.03225806451612903,
                "halfWidth": 0.24899598393574296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                483,
                0,
                117,
                263
              ],
              "ms": 145,
              "layout": {
                "ax": 57,
                "ay": 255,
                "unit": 249,
                "above": 1.0241935483870968,
                "below": 0.03225806451612903,
                "halfWidth": 0.24899598393574296
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                0,
                988,
                115,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 38.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                988,
                111,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 46.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                258,
                988,
                112,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 59.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                129,
                988,
                111,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 46.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g1-direction",
              "rect": [
                387,
                988,
                112,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 54.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                988,
                109,
                246
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                645,
                988,
                113,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 76.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            },
            {
              "image": "g1-direction",
              "rect": [
                516,
                988,
                109,
                246
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 244,
                "unit": 233,
                "above": 1.0472103004291846,
                "below": 0.012875536480686695,
                "halfWidth": 0.3283261802575107
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                0,
                0,
                158,
                263
              ],
              "ms": 145,
              "layout": {
                "ax": 72,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                0,
                113,
                262
              ],
              "ms": 135,
              "layout": {
                "ax": 49,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                0,
                157,
                261
              ],
              "ms": 145,
              "layout": {
                "ax": 69,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                0,
                93,
                262
              ],
              "ms": 135,
              "layout": {
                "ax": 40,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                0,
                0,
                158,
                263
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 72,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                0,
                113,
                262
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 49,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                0,
                157,
                261
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 69,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                0,
                93,
                262
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 40,
                "ay": 258,
                "unit": 249,
                "above": 1.036144578313253,
                "below": 0.020080321285140562,
                "halfWidth": 0.3534136546184739
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                0,
                209,
                265
              ],
              "ms": 105,
              "layout": {
                "ax": 99,
                "ay": 258,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                0,
                179,
                213
              ],
              "ms": 85,
              "layout": {
                "ax": 85,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                0,
                218,
                262
              ],
              "ms": 105,
              "layout": {
                "ax": 106,
                "ay": 257,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                0,
                177,
                208
              ],
              "ms": 85,
              "layout": {
                "ax": 83,
                "ay": 259,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                0,
                209,
                265
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 99,
                "ay": 258,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                0,
                179,
                213
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 85,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                0,
                218,
                262
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 106,
                "ay": 257,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                0,
                177,
                208
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 83,
                "ay": 259,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.027888446215139442,
                "halfWidth": 0.44621513944223107
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                645,
                0,
                168,
                218
              ],
              "ms": 230,
              "layout": {
                "ax": 78,
                "ay": 214,
                "unit": 204,
                "above": 1.0490196078431373,
                "below": 0.0196078431372549,
                "halfWidth": 0.4411764705882353
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                0,
                992,
                212,
                223
              ],
              "ms": 165,
              "layout": {
                "ax": 87.5,
                "ay": 231,
                "unit": 209,
                "above": 1.105263157894737,
                "below": 0,
                "halfWidth": 0.7870813397129187
              }
            },
            {
              "image": "g1-special",
              "rect": [
                245,
                992,
                228,
                213
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 227,
                "unit": 209,
                "above": 1.105263157894737,
                "below": 0,
                "halfWidth": 0.7870813397129187
              }
            },
            {
              "image": "g1-special",
              "rect": [
                490,
                992,
                244,
                204
              ],
              "ms": 165,
              "layout": {
                "ax": 79.5,
                "ay": 226,
                "unit": 209,
                "above": 1.105263157894737,
                "below": 0,
                "halfWidth": 0.7870813397129187
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g1-special",
              "rect": [
                735,
                992,
                166,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 32.5,
                "ay": 228,
                "unit": 222,
                "above": 1.0315315315315314,
                "below": 0.03153153153153153,
                "halfWidth": 0.6013513513513513
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                992,
                143,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 38.5,
                "ay": 228,
                "unit": 222,
                "above": 1.0315315315315314,
                "below": 0.03153153153153153,
                "halfWidth": 0.6013513513513513
              }
            },
            {
              "image": "g1-special",
              "rect": [
                1225,
                992,
                142,
                236
              ],
              "ms": 160,
              "layout": {
                "ax": 58.5,
                "ay": 229,
                "unit": 222,
                "above": 1.0315315315315314,
                "below": 0.03153153153153153,
                "halfWidth": 0.6013513513513513
              }
            },
            {
              "image": "g1-special",
              "rect": [
                980,
                992,
                143,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 38.5,
                "ay": 228,
                "unit": 222,
                "above": 1.0315315315315314,
                "below": 0.03153153153153153,
                "halfWidth": 0.6013513513513513
              }
            }
          ]
        }
      }
    },
    "char_06": {
      "id": 6,
      "name": "ملك",
      "original": "originals/char_06.png",
      "originalFilename": "06_Malak_ملك.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                0,
                116,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 19.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                0,
                117,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 21.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                0,
                121,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 42.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                0,
                117,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 21.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                916,
                0,
                205,
                259
              ],
              "ms": 105,
              "layout": {
                "ax": 97,
                "ay": 256,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                267,
                179,
                220
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                267,
                219,
                258
              ],
              "ms": 105,
              "layout": {
                "ax": 106,
                "ay": 255,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                267,
                175,
                217
              ],
              "ms": 85,
              "layout": {
                "ax": 82,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                860,
                0,
                163,
                205
              ],
              "ms": 180,
              "layout": {
                "ax": 76,
                "ay": 196,
                "unit": 239,
                "above": 1.104602510460251,
                "below": 0.03765690376569038,
                "halfWidth": 0.4309623430962343
              }
            },
            {
              "image": "second-jump",
              "rect": [
                0,
                260,
                172,
                253
              ],
              "ms": 100,
              "layout": {
                "ax": 93,
                "ay": 244,
                "unit": 239,
                "above": 1.104602510460251,
                "below": 0.03765690376569038,
                "halfWidth": 0.4309623430962343
              }
            },
            {
              "image": "second-jump",
              "rect": [
                215,
                260,
                197,
                226
              ],
              "ms": 215,
              "layout": {
                "ax": 103,
                "ay": 264,
                "unit": 239,
                "above": 1.104602510460251,
                "below": 0.03765690376569038,
                "halfWidth": 0.4309623430962343
              }
            },
            {
              "image": "second-jump",
              "rect": [
                430,
                260,
                175,
                217
              ],
              "ms": 160,
              "layout": {
                "ax": 83,
                "ay": 208,
                "unit": 239,
                "above": 1.104602510460251,
                "below": 0.03765690376569038,
                "halfWidth": 0.4309623430962343
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                768,
                0,
                115,
                269
              ],
              "ms": 1000,
              "layout": {
                "ax": 58,
                "ay": 261,
                "unit": 255,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.2559055118110236
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                768,
                0,
                115,
                269
              ],
              "ms": 95,
              "layout": {
                "ax": 58,
                "ay": 261,
                "unit": 255,
                "above": 1.0257510729613735,
                "below": 0.034334763948497854,
                "halfWidth": 0.41201716738197425
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                0,
                272,
                152,
                247
              ],
              "ms": 1050,
              "layout": {
                "ax": 56,
                "ay": 239,
                "unit": 233,
                "above": 1.0257510729613735,
                "below": 0.034334763948497854,
                "halfWidth": 0.41201716738197425
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                768,
                0,
                115,
                269
              ],
              "ms": 120,
              "layout": {
                "ax": 32,
                "ay": 259,
                "unit": 255,
                "above": 1.0156862745098039,
                "below": 0.043137254901960784,
                "halfWidth": 0.3254901960784314
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                192,
                272,
                107,
                261
              ],
              "ms": 1100,
              "layout": {
                "ax": 69,
                "ay": 250,
                "unit": 255,
                "above": 1.0156862745098039,
                "below": 0.043137254901960784,
                "halfWidth": 0.3254901960784314
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                768,
                0,
                115,
                269
              ],
              "ms": 120,
              "layout": {
                "ax": 32,
                "ay": 259,
                "unit": 256,
                "above": 1.01171875,
                "below": 0.04296875,
                "halfWidth": 0.4140625
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                384,
                272,
                139,
                270
              ],
              "ms": 1100,
              "layout": {
                "ax": 106,
                "ay": 259,
                "unit": 256,
                "above": 1.01171875,
                "below": 0.04296875,
                "halfWidth": 0.4140625
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                644,
                0,
                113,
                268
              ],
              "ms": 160,
              "layout": {
                "ax": 56,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.2559055118110236
              }
            },
            {
              "image": "second-clap",
              "rect": [
                0,
                269,
                116,
                268
              ],
              "ms": 135,
              "layout": {
                "ax": 53,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.2559055118110236
              }
            },
            {
              "image": "second-clap",
              "rect": [
                161,
                269,
                102,
                268
              ],
              "ms": 100,
              "layout": {
                "ax": 51,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.2559055118110236
              }
            },
            {
              "image": "second-clap",
              "rect": [
                322,
                269,
                118,
                268
              ],
              "ms": 145,
              "layout": {
                "ax": 53,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.2559055118110236
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                0,
                116,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 19.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                0,
                117,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 21.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                0,
                121,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 42.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                0,
                117,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 21.5,
                "ay": 234,
                "unit": 234,
                "above": 1,
                "below": 0.05982905982905983,
                "halfWidth": 0.41239316239316237
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                405,
                0,
                111,
                246
              ],
              "ms": 142,
              "layout": {
                "ax": 54.5,
                "ay": 233,
                "unit": 233,
                "above": 1.0042918454935623,
                "below": 0.055793991416309016,
                "halfWidth": 0.3798283261802575
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                0,
                118,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 234,
                "unit": 233,
                "above": 1.0042918454935623,
                "below": 0.055793991416309016,
                "halfWidth": 0.3798283261802575
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                675,
                0,
                117,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 88.5,
                "ay": 234,
                "unit": 233,
                "above": 1.0042918454935623,
                "below": 0.055793991416309016,
                "halfWidth": 0.3798283261802575
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                0,
                118,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 234,
                "unit": 233,
                "above": 1.0042918454935623,
                "below": 0.055793991416309016,
                "halfWidth": 0.3798283261802575
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                748,
                0,
                158,
                265
              ],
              "ms": 145,
              "layout": {
                "ax": 72,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                268,
                118,
                264
              ],
              "ms": 135,
              "layout": {
                "ax": 49,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                268,
                157,
                264
              ],
              "ms": 145,
              "layout": {
                "ax": 68,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                268,
                107,
                265
              ],
              "ms": 135,
              "layout": {
                "ax": 48,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                748,
                0,
                158,
                265
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 72,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                268,
                118,
                264
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 49,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                268,
                157,
                264
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 68,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                268,
                107,
                265
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 48,
                "ay": 260,
                "unit": 251,
                "above": 1.0358565737051793,
                "below": 0.0199203187250996,
                "halfWidth": 0.3545816733067729
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                916,
                0,
                205,
                259
              ],
              "ms": 105,
              "layout": {
                "ax": 97,
                "ay": 256,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                267,
                179,
                220
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                267,
                219,
                258
              ],
              "ms": 105,
              "layout": {
                "ax": 106,
                "ay": 255,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                267,
                175,
                217
              ],
              "ms": 85,
              "layout": {
                "ax": 82,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                916,
                0,
                205,
                259
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 97,
                "ay": 256,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                267,
                179,
                220
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 87,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                267,
                219,
                258
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 106,
                "ay": 255,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                267,
                175,
                217
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 82,
                "ay": 262,
                "unit": 245,
                "above": 1.0693877551020408,
                "below": 0.012244897959183673,
                "halfWidth": 0.46122448979591835
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                430,
                260,
                175,
                217
              ],
              "ms": 230,
              "layout": {
                "ax": 83,
                "ay": 208,
                "unit": 203,
                "above": 1.0246305418719213,
                "below": 0.04433497536945813,
                "halfWidth": 0.45320197044334976
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                0,
                0,
                193,
                214
              ],
              "ms": 165,
              "layout": {
                "ax": 94.5,
                "ay": 229,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.7132701421800948
              }
            },
            {
              "image": "g2-special",
              "rect": [
                256,
                0,
                212,
                225
              ],
              "ms": 165,
              "layout": {
                "ax": 91.5,
                "ay": 231,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.7132701421800948
              }
            },
            {
              "image": "g2-special",
              "rect": [
                512,
                0,
                238,
                216
              ],
              "ms": 165,
              "layout": {
                "ax": 87.5,
                "ay": 231,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.7132701421800948
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                768,
                0,
                146,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 46.5,
                "ay": 227,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.44819819819819817
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                0,
                132,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 54.5,
                "ay": 227,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.44819819819819817
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1280,
                0,
                127,
                236
              ],
              "ms": 160,
              "layout": {
                "ax": 58.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.44819819819819817
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                0,
                132,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 54.5,
                "ay": 227,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.44819819819819817
              }
            }
          ]
        }
      }
    },
    "char_07": {
      "id": 7,
      "name": "عمر",
      "original": "originals/char_07.png",
      "originalFilename": "07_Omar_عمر.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                248,
                124,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 28.5,
                "ay": 226,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                248,
                126,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 31.5,
                "ay": 225,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                248,
                129,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 44.5,
                "ay": 226,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                248,
                126,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 31.5,
                "ay": 225,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                687,
                267,
                211,
                266
              ],
              "ms": 105,
              "layout": {
                "ax": 101,
                "ay": 260,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                267,
                178,
                215
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 265,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                534,
                229,
                264
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 258,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                534,
                176,
                213
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 264,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                645,
                260,
                177,
                210
              ],
              "ms": 180,
              "layout": {
                "ax": 85,
                "ay": 202,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.49173553719008267
              }
            },
            {
              "image": "second-jump",
              "rect": [
                860,
                260,
                193,
                256
              ],
              "ms": 100,
              "layout": {
                "ax": 103,
                "ay": 249,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.49173553719008267
              }
            },
            {
              "image": "second-jump",
              "rect": [
                0,
                520,
                215,
                242
              ],
              "ms": 215,
              "layout": {
                "ax": 119,
                "ay": 265,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.49173553719008267
              }
            },
            {
              "image": "second-jump",
              "rect": [
                215,
                520,
                184,
                220
              ],
              "ms": 160,
              "layout": {
                "ax": 86,
                "ay": 214,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.49173553719008267
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                576,
                272,
                123,
                268
              ],
              "ms": 1000,
              "layout": {
                "ax": 64,
                "ay": 260,
                "unit": 254,
                "above": 1.0242914979757085,
                "below": 0.032388663967611336,
                "halfWidth": 0.29959514170040485
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                576,
                272,
                123,
                268
              ],
              "ms": 95,
              "layout": {
                "ax": 64,
                "ay": 260,
                "unit": 254,
                "above": 1.0263157894736843,
                "below": 0.03508771929824561,
                "halfWidth": 0.38596491228070173
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                768,
                272,
                170,
                242
              ],
              "ms": 1050,
              "layout": {
                "ax": 88,
                "ay": 234,
                "unit": 228,
                "above": 1.0263157894736843,
                "below": 0.03508771929824561,
                "halfWidth": 0.38596491228070173
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                576,
                272,
                123,
                268
              ],
              "ms": 120,
              "layout": {
                "ax": 33,
                "ay": 257,
                "unit": 254,
                "above": 1.0118110236220472,
                "below": 0.047244094488188976,
                "halfWidth": 0.3543307086614173
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                0,
                544,
                125,
                256
              ],
              "ms": 1100,
              "layout": {
                "ax": 80,
                "ay": 244,
                "unit": 254,
                "above": 1.0118110236220472,
                "below": 0.047244094488188976,
                "halfWidth": 0.3543307086614173
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                576,
                272,
                123,
                268
              ],
              "ms": 120,
              "layout": {
                "ax": 33,
                "ay": 257,
                "unit": 254,
                "above": 1.0118110236220472,
                "below": 0.04330708661417323,
                "halfWidth": 0.4330708661417323
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                192,
                544,
                153,
                265
              ],
              "ms": 1100,
              "layout": {
                "ax": 110,
                "ay": 254,
                "unit": 254,
                "above": 1.0118110236220472,
                "below": 0.04330708661417323,
                "halfWidth": 0.4330708661417323
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                483,
                269,
                139,
                261
              ],
              "ms": 160,
              "layout": {
                "ax": 74,
                "ay": 253,
                "unit": 247,
                "above": 1.0242914979757085,
                "below": 0.032388663967611336,
                "halfWidth": 0.29959514170040485
              }
            },
            {
              "image": "second-clap",
              "rect": [
                644,
                269,
                139,
                261
              ],
              "ms": 135,
              "layout": {
                "ax": 68,
                "ay": 253,
                "unit": 247,
                "above": 1.0242914979757085,
                "below": 0.032388663967611336,
                "halfWidth": 0.29959514170040485
              }
            },
            {
              "image": "second-clap",
              "rect": [
                0,
                538,
                116,
                261
              ],
              "ms": 100,
              "layout": {
                "ax": 60,
                "ay": 253,
                "unit": 247,
                "above": 1.0242914979757085,
                "below": 0.032388663967611336,
                "halfWidth": 0.29959514170040485
              }
            },
            {
              "image": "second-clap",
              "rect": [
                161,
                538,
                124,
                261
              ],
              "ms": 145,
              "layout": {
                "ax": 63,
                "ay": 253,
                "unit": 247,
                "above": 1.0242914979757085,
                "below": 0.032388663967611336,
                "halfWidth": 0.29959514170040485
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                248,
                124,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 28.5,
                "ay": 226,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                248,
                126,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 31.5,
                "ay": 225,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                248,
                129,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 44.5,
                "ay": 226,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                248,
                126,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 31.5,
                "ay": 225,
                "unit": 234,
                "above": 0.9658119658119658,
                "below": 0.09401709401709402,
                "halfWidth": 0.4081196581196581
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                405,
                248,
                122,
                246
              ],
              "ms": 142,
              "layout": {
                "ax": 62.5,
                "ay": 224,
                "unit": 233,
                "above": 0.9656652360515021,
                "below": 0.0944206008583691,
                "halfWidth": 0.3927038626609442
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                248,
                121,
                246
              ],
              "ms": 116,
              "layout": {
                "ax": 76.5,
                "ay": 225,
                "unit": 233,
                "above": 0.9656652360515021,
                "below": 0.0944206008583691,
                "halfWidth": 0.3927038626609442
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                675,
                248,
                125,
                247
              ],
              "ms": 142,
              "layout": {
                "ax": 91.5,
                "ay": 225,
                "unit": 233,
                "above": 0.9656652360515021,
                "below": 0.0944206008583691,
                "halfWidth": 0.3927038626609442
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                248,
                121,
                246
              ],
              "ms": 116,
              "layout": {
                "ax": 76.5,
                "ay": 225,
                "unit": 233,
                "above": 0.9656652360515021,
                "below": 0.0944206008583691,
                "halfWidth": 0.3927038626609442
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                561,
                268,
                165,
                267
              ],
              "ms": 145,
              "layout": {
                "ax": 75,
                "ay": 261,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                268,
                125,
                268
              ],
              "ms": 135,
              "layout": {
                "ax": 55,
                "ay": 261,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                536,
                175,
                266
              ],
              "ms": 145,
              "layout": {
                "ax": 73,
                "ay": 260,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                536,
                101,
                267
              ],
              "ms": 135,
              "layout": {
                "ax": 44,
                "ay": 260,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                561,
                268,
                165,
                267
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 75,
                "ay": 261,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                268,
                125,
                268
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 55,
                "ay": 261,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                536,
                175,
                266
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 73,
                "ay": 260,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                536,
                101,
                267
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 44,
                "ay": 260,
                "unit": 254,
                "above": 1.0275590551181102,
                "below": 0.027559055118110236,
                "halfWidth": 0.4015748031496063
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                687,
                267,
                211,
                266
              ],
              "ms": 105,
              "layout": {
                "ax": 101,
                "ay": 260,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                267,
                178,
                215
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 265,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                534,
                229,
                264
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 258,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                534,
                176,
                213
              ],
              "ms": 85,
              "layout": {
                "ax": 87,
                "ay": 264,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                687,
                267,
                211,
                266
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 101,
                "ay": 260,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                267,
                178,
                215
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 87,
                "ay": 265,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                534,
                229,
                264
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 108,
                "ay": 258,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                534,
                176,
                213
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 87,
                "ay": 264,
                "unit": 252,
                "above": 1.0515873015873016,
                "below": 0.023809523809523808,
                "halfWidth": 0.4801587301587302
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                215,
                520,
                184,
                220
              ],
              "ms": 230,
              "layout": {
                "ax": 86,
                "ay": 214,
                "unit": 206,
                "above": 1.0388349514563107,
                "below": 0.02912621359223301,
                "halfWidth": 0.47572815533980584
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                0,
                253,
                200,
                224
              ],
              "ms": 165,
              "layout": {
                "ax": 96.5,
                "ay": 241,
                "unit": 218,
                "above": 1.114678899082569,
                "below": 0,
                "halfWidth": 0.7041284403669725
              }
            },
            {
              "image": "g2-special",
              "rect": [
                256,
                253,
                218,
                232
              ],
              "ms": 165,
              "layout": {
                "ax": 96.5,
                "ay": 242,
                "unit": 218,
                "above": 1.114678899082569,
                "below": 0,
                "halfWidth": 0.7041284403669725
              }
            },
            {
              "image": "g2-special",
              "rect": [
                512,
                253,
                248,
                220
              ],
              "ms": 165,
              "layout": {
                "ax": 94.5,
                "ay": 243,
                "unit": 218,
                "above": 1.114678899082569,
                "below": 0,
                "halfWidth": 0.7041284403669725
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                768,
                253,
                149,
                242
              ],
              "ms": 160,
              "layout": {
                "ax": 45.5,
                "ay": 240,
                "unit": 228,
                "above": 1.0526315789473684,
                "below": 0.008771929824561403,
                "halfWidth": 0.45394736842105265
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                253,
                138,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 53.5,
                "ay": 239,
                "unit": 228,
                "above": 1.0526315789473684,
                "below": 0.008771929824561403,
                "halfWidth": 0.45394736842105265
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1280,
                253,
                137,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 59.5,
                "ay": 239,
                "unit": 228,
                "above": 1.0526315789473684,
                "below": 0.008771929824561403,
                "halfWidth": 0.45394736842105265
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                253,
                138,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 53.5,
                "ay": 239,
                "unit": 228,
                "above": 1.0526315789473684,
                "below": 0.008771929824561403,
                "halfWidth": 0.45394736842105265
              }
            }
          ]
        }
      }
    },
    "char_08": {
      "id": 8,
      "name": "هنا",
      "original": "originals/char_08.png",
      "originalFilename": "08_Hana_هنا.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                496,
                110,
                228
              ],
              "ms": 142,
              "layout": {
                "ax": 16.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                496,
                112,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 22.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                496,
                113,
                228
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                496,
                112,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 22.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                458,
                534,
                214,
                261
              ],
              "ms": 105,
              "layout": {
                "ax": 102,
                "ay": 254,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                534,
                172,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 82,
                "ay": 261,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                534,
                222,
                258
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 252,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                801,
                172,
                205
              ],
              "ms": 85,
              "layout": {
                "ax": 81,
                "ay": 260,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                430,
                520,
                155,
                204
              ],
              "ms": 180,
              "layout": {
                "ax": 74,
                "ay": 196,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.44214876033057854
              }
            },
            {
              "image": "second-jump",
              "rect": [
                645,
                520,
                176,
                256
              ],
              "ms": 100,
              "layout": {
                "ax": 96,
                "ay": 250,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.44214876033057854
              }
            },
            {
              "image": "second-jump",
              "rect": [
                860,
                520,
                207,
                222
              ],
              "ms": 215,
              "layout": {
                "ax": 107,
                "ay": 265,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.44214876033057854
              }
            },
            {
              "image": "second-jump",
              "rect": [
                0,
                780,
                160,
                214
              ],
              "ms": 160,
              "layout": {
                "ax": 78,
                "ay": 206,
                "unit": 242,
                "above": 1.0950413223140496,
                "below": 0.03305785123966942,
                "halfWidth": 0.44214876033057854
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                384,
                544,
                120,
                270
              ],
              "ms": 1000,
              "layout": {
                "ax": 63,
                "ay": 262,
                "unit": 256,
                "above": 1.024,
                "below": 0.032,
                "halfWidth": 0.296
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                384,
                544,
                120,
                270
              ],
              "ms": 95,
              "layout": {
                "ax": 63,
                "ay": 262,
                "unit": 256,
                "above": 1.0272727272727273,
                "below": 0.03636363636363636,
                "halfWidth": 0.41818181818181815
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                576,
                544,
                171,
                234
              ],
              "ms": 1050,
              "layout": {
                "ax": 92,
                "ay": 226,
                "unit": 220,
                "above": 1.0272727272727273,
                "below": 0.03636363636363636,
                "halfWidth": 0.41818181818181815
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                384,
                544,
                120,
                270
              ],
              "ms": 120,
              "layout": {
                "ax": 30,
                "ay": 258,
                "unit": 256,
                "above": 1.0078125,
                "below": 0.046875,
                "halfWidth": 0.3515625
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                768,
                544,
                121,
                264
              ],
              "ms": 1100,
              "layout": {
                "ax": 80,
                "ay": 252,
                "unit": 256,
                "above": 1.0078125,
                "below": 0.046875,
                "halfWidth": 0.3515625
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                384,
                544,
                120,
                270
              ],
              "ms": 120,
              "layout": {
                "ax": 30,
                "ay": 258,
                "unit": 258,
                "above": 1.0077519379844961,
                "below": 0.046511627906976744,
                "halfWidth": 0.43410852713178294
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                0,
                816,
                151,
                272
              ],
              "ms": 1100,
              "layout": {
                "ax": 112,
                "ay": 260,
                "unit": 258,
                "above": 1.0077519379844961,
                "below": 0.046511627906976744,
                "halfWidth": 0.43410852713178294
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                322,
                538,
                110,
                264
              ],
              "ms": 160,
              "layout": {
                "ax": 57,
                "ay": 256,
                "unit": 250,
                "above": 1.024,
                "below": 0.032,
                "halfWidth": 0.296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                483,
                538,
                126,
                265
              ],
              "ms": 135,
              "layout": {
                "ax": 57,
                "ay": 257,
                "unit": 251,
                "above": 1.024,
                "below": 0.032,
                "halfWidth": 0.296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                644,
                538,
                107,
                265
              ],
              "ms": 100,
              "layout": {
                "ax": 57,
                "ay": 257,
                "unit": 251,
                "above": 1.024,
                "below": 0.032,
                "halfWidth": 0.296
              }
            },
            {
              "image": "second-clap",
              "rect": [
                0,
                807,
                129,
                264
              ],
              "ms": 145,
              "layout": {
                "ax": 55,
                "ay": 256,
                "unit": 250,
                "above": 1.024,
                "below": 0.032,
                "halfWidth": 0.296
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                496,
                110,
                228
              ],
              "ms": 142,
              "layout": {
                "ax": 16.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                496,
                112,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 22.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                496,
                113,
                228
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                496,
                112,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 22.5,
                "ay": 218,
                "unit": 215,
                "above": 1.013953488372093,
                "below": 0.05116279069767442,
                "halfWidth": 0.43488372093023253
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                405,
                496,
                107,
                225
              ],
              "ms": 142,
              "layout": {
                "ax": 53.5,
                "ay": 215,
                "unit": 213,
                "above": 1.0140845070422535,
                "below": 0.051643192488262914,
                "halfWidth": 0.3779342723004695
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                496,
                113,
                227
              ],
              "ms": 116,
              "layout": {
                "ax": 69.5,
                "ay": 216,
                "unit": 213,
                "above": 1.0140845070422535,
                "below": 0.051643192488262914,
                "halfWidth": 0.3779342723004695
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                675,
                496,
                107,
                227
              ],
              "ms": 142,
              "layout": {
                "ax": 80.5,
                "ay": 216,
                "unit": 213,
                "above": 1.0140845070422535,
                "below": 0.051643192488262914,
                "halfWidth": 0.3779342723004695
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                496,
                113,
                227
              ],
              "ms": 116,
              "layout": {
                "ax": 69.5,
                "ay": 216,
                "unit": 213,
                "above": 1.0140845070422535,
                "below": 0.051643192488262914,
                "halfWidth": 0.3779342723004695
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                374,
                536,
                165,
                264
              ],
              "ms": 145,
              "layout": {
                "ax": 78,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                536,
                113,
                264
              ],
              "ms": 135,
              "layout": {
                "ax": 48,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                536,
                169,
                263
              ],
              "ms": 145,
              "layout": {
                "ax": 73,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                804,
                99,
                263
              ],
              "ms": 135,
              "layout": {
                "ax": 42,
                "ay": 260,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                374,
                536,
                165,
                264
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 78,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                536,
                113,
                264
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 48,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                536,
                169,
                263
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 73,
                "ay": 261,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            },
            {
              "image": "second-walk",
              "rect": [
                0,
                804,
                99,
                263
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 42,
                "ay": 260,
                "unit": 250,
                "above": 1.044,
                "below": 0.012,
                "halfWidth": 0.384
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                458,
                534,
                214,
                261
              ],
              "ms": 105,
              "layout": {
                "ax": 102,
                "ay": 254,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                534,
                172,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 82,
                "ay": 261,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                534,
                222,
                258
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 252,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                801,
                172,
                205
              ],
              "ms": 85,
              "layout": {
                "ax": 81,
                "ay": 260,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                458,
                534,
                214,
                261
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 102,
                "ay": 254,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                534,
                172,
                210
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 82,
                "ay": 261,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                534,
                222,
                258
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 108,
                "ay": 252,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            },
            {
              "image": "second-run",
              "rect": [
                0,
                801,
                172,
                205
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 81,
                "ay": 260,
                "unit": 247,
                "above": 1.05668016194332,
                "below": 0.02834008097165992,
                "halfWidth": 0.46153846153846156
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                0,
                780,
                160,
                214
              ],
              "ms": 230,
              "layout": {
                "ax": 78,
                "ay": 206,
                "unit": 200,
                "above": 1.03,
                "below": 0.04,
                "halfWidth": 0.41
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                0,
                506,
                193,
                210
              ],
              "ms": 165,
              "layout": {
                "ax": 96.5,
                "ay": 241,
                "unit": 199,
                "above": 1.2311557788944723,
                "below": 0,
                "halfWidth": 0.7613065326633166
              }
            },
            {
              "image": "g2-special",
              "rect": [
                256,
                506,
                223,
                209
              ],
              "ms": 165,
              "layout": {
                "ax": 95.5,
                "ay": 241,
                "unit": 199,
                "above": 1.2311557788944723,
                "below": 0,
                "halfWidth": 0.7613065326633166
              }
            },
            {
              "image": "g2-special",
              "rect": [
                512,
                506,
                247,
                213
              ],
              "ms": 165,
              "layout": {
                "ax": 95.5,
                "ay": 245,
                "unit": 199,
                "above": 1.2311557788944723,
                "below": 0,
                "halfWidth": 0.7613065326633166
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                768,
                506,
                144,
                233
              ],
              "ms": 160,
              "layout": {
                "ax": 42.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0672645739910314,
                "below": 0,
                "halfWidth": 0.4551569506726457
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                506,
                142,
                233
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0672645739910314,
                "below": 0,
                "halfWidth": 0.4551569506726457
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1280,
                506,
                133,
                237
              ],
              "ms": 160,
              "layout": {
                "ax": 60.5,
                "ay": 238,
                "unit": 223,
                "above": 1.0672645739910314,
                "below": 0,
                "halfWidth": 0.4551569506726457
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                506,
                142,
                233
              ],
              "ms": 160,
              "layout": {
                "ax": 57.5,
                "ay": 234,
                "unit": 223,
                "above": 1.0672645739910314,
                "below": 0,
                "halfWidth": 0.4551569506726457
              }
            }
          ]
        }
      }
    },
    "char_09": {
      "id": 9,
      "name": "ليث",
      "original": "originals/char_09.png",
      "originalFilename": "09_Laith_ليث.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                744,
                135,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                744,
                128,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 42.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                744,
                122,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 43.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                744,
                128,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 42.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                229,
                801,
                225,
                267
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 257,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                801,
                195,
                217
              ],
              "ms": 85,
              "layout": {
                "ax": 98,
                "ay": 264,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                801,
                229,
                260
              ],
              "ms": 105,
              "layout": {
                "ax": 111,
                "ay": 253,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                801,
                189,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 91,
                "ay": 263,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                215,
                780,
                194,
                220
              ],
              "ms": 180,
              "layout": {
                "ax": 106,
                "ay": 213,
                "unit": 246,
                "above": 1.1056910569105691,
                "below": 0.028455284552845527,
                "halfWidth": 0.43089430894308944
              }
            },
            {
              "image": "second-jump",
              "rect": [
                430,
                780,
                188,
                260
              ],
              "ms": 100,
              "layout": {
                "ax": 101,
                "ay": 254,
                "unit": 246,
                "above": 1.1056910569105691,
                "below": 0.028455284552845527,
                "halfWidth": 0.43089430894308944
              }
            },
            {
              "image": "second-jump",
              "rect": [
                645,
                780,
                194,
                234
              ],
              "ms": 215,
              "layout": {
                "ax": 104,
                "ay": 272,
                "unit": 246,
                "above": 1.1056910569105691,
                "below": 0.028455284552845527,
                "halfWidth": 0.43089430894308944
              }
            },
            {
              "image": "second-jump",
              "rect": [
                860,
                780,
                197,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 106,
                "ay": 211,
                "unit": 246,
                "above": 1.1056910569105691,
                "below": 0.028455284552845527,
                "halfWidth": 0.43089430894308944
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                192,
                816,
                145,
                269
              ],
              "ms": 1000,
              "layout": {
                "ax": 87,
                "ay": 261,
                "unit": 255,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.3411764705882353
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                192,
                816,
                145,
                269
              ],
              "ms": 95,
              "layout": {
                "ax": 87,
                "ay": 261,
                "unit": 255,
                "above": 1.026431718061674,
                "below": 0.03524229074889868,
                "halfWidth": 0.43612334801762115
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                384,
                816,
                180,
                241
              ],
              "ms": 1050,
              "layout": {
                "ax": 81,
                "ay": 233,
                "unit": 227,
                "above": 1.026431718061674,
                "below": 0.03524229074889868,
                "halfWidth": 0.43612334801762115
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                192,
                816,
                145,
                269
              ],
              "ms": 120,
              "layout": {
                "ax": 50,
                "ay": 260,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.4470588235294118
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                576,
                816,
                170,
                258
              ],
              "ms": 1100,
              "layout": {
                "ax": 114,
                "ay": 250,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.4470588235294118
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                192,
                816,
                145,
                269
              ],
              "ms": 120,
              "layout": {
                "ax": 50,
                "ay": 260,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.44313725490196076
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                768,
                816,
                181,
                267
              ],
              "ms": 1100,
              "layout": {
                "ax": 113,
                "ay": 260,
                "unit": 255,
                "above": 1.0196078431372548,
                "below": 0.03529411764705882,
                "halfWidth": 0.44313725490196076
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                161,
                807,
                143,
                269
              ],
              "ms": 160,
              "layout": {
                "ax": 84,
                "ay": 261,
                "unit": 255,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.3411764705882353
              }
            },
            {
              "image": "second-clap",
              "rect": [
                322,
                807,
                160,
                269
              ],
              "ms": 135,
              "layout": {
                "ax": 84,
                "ay": 261,
                "unit": 255,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.3411764705882353
              }
            },
            {
              "image": "second-clap",
              "rect": [
                483,
                807,
                141,
                268
              ],
              "ms": 100,
              "layout": {
                "ax": 82,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.3411764705882353
              }
            },
            {
              "image": "second-clap",
              "rect": [
                644,
                807,
                154,
                268
              ],
              "ms": 145,
              "layout": {
                "ax": 84,
                "ay": 260,
                "unit": 254,
                "above": 1.0236220472440944,
                "below": 0.031496062992125984,
                "halfWidth": 0.3411764705882353
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                744,
                135,
                233
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                744,
                128,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 42.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                744,
                122,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 43.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                744,
                128,
                229
              ],
              "ms": 116,
              "layout": {
                "ax": 42.5,
                "ay": 227,
                "unit": 219,
                "above": 1.0365296803652968,
                "below": 0.0273972602739726,
                "halfWidth": 0.4497716894977169
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                405,
                744,
                131,
                226
              ],
              "ms": 142,
              "layout": {
                "ax": 54.5,
                "ay": 223,
                "unit": 215,
                "above": 1.041860465116279,
                "below": 0.023255813953488372,
                "halfWidth": 0.4069767441860465
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                744,
                114,
                226
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 224,
                "unit": 215,
                "above": 1.041860465116279,
                "below": 0.023255813953488372,
                "halfWidth": 0.4069767441860465
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                675,
                744,
                126,
                229
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 224,
                "unit": 215,
                "above": 1.041860465116279,
                "below": 0.023255813953488372,
                "halfWidth": 0.4069767441860465
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                744,
                114,
                226
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 224,
                "unit": 215,
                "above": 1.041860465116279,
                "below": 0.023255813953488372,
                "halfWidth": 0.4069767441860465
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                187,
                804,
                181,
                268
              ],
              "ms": 145,
              "layout": {
                "ax": 88,
                "ay": 262,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                804,
                138,
                266
              ],
              "ms": 135,
              "layout": {
                "ax": 65,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                804,
                179,
                264
              ],
              "ms": 145,
              "layout": {
                "ax": 78,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                804,
                123,
                266
              ],
              "ms": 135,
              "layout": {
                "ax": 50,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                187,
                804,
                181,
                268
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 88,
                "ay": 262,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                804,
                138,
                266
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 65,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                804,
                179,
                264
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 78,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            },
            {
              "image": "second-walk",
              "rect": [
                748,
                804,
                123,
                266
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 50,
                "ay": 261,
                "unit": 254,
                "above": 1.031496062992126,
                "below": 0.023622047244094488,
                "halfWidth": 0.39763779527559057
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                229,
                801,
                225,
                267
              ],
              "ms": 105,
              "layout": {
                "ax": 108,
                "ay": 257,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                801,
                195,
                217
              ],
              "ms": 85,
              "layout": {
                "ax": 98,
                "ay": 264,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                801,
                229,
                260
              ],
              "ms": 105,
              "layout": {
                "ax": 111,
                "ay": 253,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                801,
                189,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 91,
                "ay": 263,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                229,
                801,
                225,
                267
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 108,
                "ay": 257,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                801,
                195,
                217
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 98,
                "ay": 264,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                801,
                229,
                260
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 111,
                "ay": 253,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            },
            {
              "image": "second-run",
              "rect": [
                916,
                801,
                189,
                210
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 91,
                "ay": 263,
                "unit": 253,
                "above": 1.0434782608695652,
                "below": 0.039525691699604744,
                "halfWidth": 0.466403162055336
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                860,
                780,
                197,
                218
              ],
              "ms": 230,
              "layout": {
                "ax": 106,
                "ay": 211,
                "unit": 204,
                "above": 1.0343137254901962,
                "below": 0.03431372549019608,
                "halfWidth": 0.5196078431372549
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                0,
                759,
                221,
                227
              ],
              "ms": 165,
              "layout": {
                "ax": 112.5,
                "ay": 250,
                "unit": 216,
                "above": 1.162037037037037,
                "below": 0,
                "halfWidth": 0.7152777777777778
              }
            },
            {
              "image": "g2-special",
              "rect": [
                256,
                759,
                240,
                230
              ],
              "ms": 165,
              "layout": {
                "ax": 109.5,
                "ay": 250,
                "unit": 216,
                "above": 1.162037037037037,
                "below": 0,
                "halfWidth": 0.7152777777777778
              }
            },
            {
              "image": "g2-special",
              "rect": [
                512,
                759,
                255,
                222
              ],
              "ms": 165,
              "layout": {
                "ax": 100.5,
                "ay": 251,
                "unit": 216,
                "above": 1.162037037037037,
                "below": 0,
                "halfWidth": 0.7152777777777778
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                768,
                759,
                179,
                232
              ],
              "ms": 160,
              "layout": {
                "ax": 51.5,
                "ay": 237,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.5616740088105727
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                759,
                176,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 62.5,
                "ay": 240,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.5616740088105727
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1280,
                759,
                178,
                241
              ],
              "ms": 160,
              "layout": {
                "ax": 71.5,
                "ay": 246,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.5616740088105727
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                759,
                176,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 62.5,
                "ay": 240,
                "unit": 227,
                "above": 1.0837004405286343,
                "below": 0,
                "halfWidth": 0.5616740088105727
              }
            }
          ]
        }
      }
    },
    "char_10": {
      "id": 10,
      "name": "فلفل",
      "original": "originals/char_10.png",
      "originalFilename": "10_Felfel_فلفل.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                992,
                133,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                992,
                118,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 27.5,
                "ay": 231,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                992,
                120,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 43.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                992,
                118,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 27.5,
                "ay": 231,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                1068,
                228,
                261
              ],
              "ms": 105,
              "layout": {
                "ax": 116,
                "ay": 255,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                1068,
                198,
                209
              ],
              "ms": 85,
              "layout": {
                "ax": 106,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                1068,
                227,
                259
              ],
              "ms": 105,
              "layout": {
                "ax": 113,
                "ay": 254,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                1068,
                205,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 111,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                0,
                1040,
                186,
                212
              ],
              "ms": 180,
              "layout": {
                "ax": 100,
                "ay": 207,
                "unit": 242,
                "above": 1.0991735537190082,
                "below": 0.02066115702479339,
                "halfWidth": 0.4669421487603306
              }
            },
            {
              "image": "second-jump",
              "rect": [
                215,
                1040,
                193,
                256
              ],
              "ms": 100,
              "layout": {
                "ax": 112,
                "ay": 254,
                "unit": 242,
                "above": 1.0991735537190082,
                "below": 0.02066115702479339,
                "halfWidth": 0.4669421487603306
              }
            },
            {
              "image": "second-jump",
              "rect": [
                430,
                1040,
                198,
                228
              ],
              "ms": 215,
              "layout": {
                "ax": 113,
                "ay": 266,
                "unit": 242,
                "above": 1.0991735537190082,
                "below": 0.02066115702479339,
                "halfWidth": 0.4669421487603306
              }
            },
            {
              "image": "second-jump",
              "rect": [
                645,
                1040,
                201,
                219
              ],
              "ms": 160,
              "layout": {
                "ax": 110,
                "ay": 214,
                "unit": 242,
                "above": 1.0991735537190082,
                "below": 0.02066115702479339,
                "halfWidth": 0.4669421487603306
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                1088,
                166,
                264
              ],
              "ms": 1000,
              "layout": {
                "ax": 111,
                "ay": 256,
                "unit": 250,
                "above": 1.0244897959183674,
                "below": 0.0326530612244898,
                "halfWidth": 0.444
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                1088,
                166,
                264
              ],
              "ms": 95,
              "layout": {
                "ax": 111,
                "ay": 256,
                "unit": 250,
                "above": 1.0276497695852536,
                "below": 0.03686635944700461,
                "halfWidth": 0.4470046082949309
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                192,
                1088,
                183,
                231
              ],
              "ms": 1050,
              "layout": {
                "ax": 86,
                "ay": 223,
                "unit": 217,
                "above": 1.0276497695852536,
                "below": 0.03686635944700461,
                "halfWidth": 0.4470046082949309
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                1088,
                166,
                264
              ],
              "ms": 120,
              "layout": {
                "ax": 76,
                "ay": 259,
                "unit": 250,
                "above": 1.036,
                "below": 0.02,
                "halfWidth": 0.496
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                384,
                1088,
                181,
                251
              ],
              "ms": 1100,
              "layout": {
                "ax": 124,
                "ay": 247,
                "unit": 250,
                "above": 1.036,
                "below": 0.02,
                "halfWidth": 0.496
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "second-emotion",
              "rect": [
                0,
                1088,
                166,
                264
              ],
              "ms": 120,
              "layout": {
                "ax": 76,
                "ay": 259,
                "unit": 254,
                "above": 1.0354330708661417,
                "below": 0.01968503937007874,
                "halfWidth": 0.5
              }
            },
            {
              "image": "second-emotion",
              "rect": [
                576,
                1088,
                192,
                268
              ],
              "ms": 1100,
              "layout": {
                "ax": 127,
                "ay": 263,
                "unit": 254,
                "above": 1.0354330708661417,
                "below": 0.01968503937007874,
                "halfWidth": 0.5
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "second-clap",
              "rect": [
                0,
                1076,
                146,
                259
              ],
              "ms": 160,
              "layout": {
                "ax": 91,
                "ay": 251,
                "unit": 245,
                "above": 1.0244897959183674,
                "below": 0.0326530612244898,
                "halfWidth": 0.444
              }
            },
            {
              "image": "second-clap",
              "rect": [
                161,
                1076,
                161,
                260
              ],
              "ms": 135,
              "layout": {
                "ax": 89,
                "ay": 252,
                "unit": 246,
                "above": 1.0244897959183674,
                "below": 0.0326530612244898,
                "halfWidth": 0.444
              }
            },
            {
              "image": "second-clap",
              "rect": [
                322,
                1076,
                137,
                259
              ],
              "ms": 100,
              "layout": {
                "ax": 87,
                "ay": 251,
                "unit": 245,
                "above": 1.0244897959183674,
                "below": 0.0326530612244898,
                "halfWidth": 0.444
              }
            },
            {
              "image": "second-clap",
              "rect": [
                483,
                1076,
                157,
                262
              ],
              "ms": 145,
              "layout": {
                "ax": 89,
                "ay": 254,
                "unit": 248,
                "above": 1.0244897959183674,
                "below": 0.0326530612244898,
                "halfWidth": 0.444
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                0,
                992,
                133,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 36.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                992,
                118,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 27.5,
                "ay": 231,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                270,
                992,
                120,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 43.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                135,
                992,
                118,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 27.5,
                "ay": 231,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.4346846846846847
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g2-direction",
              "rect": [
                405,
                992,
                122,
                235
              ],
              "ms": 142,
              "layout": {
                "ax": 63.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.39864864864864863
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                992,
                119,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 78.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.39864864864864863
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                675,
                992,
                130,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 88.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.39864864864864863
              }
            },
            {
              "image": "g2-direction",
              "rect": [
                540,
                992,
                119,
                235
              ],
              "ms": 116,
              "layout": {
                "ax": 78.5,
                "ay": 232,
                "unit": 222,
                "above": 1.045045045045045,
                "below": 0.018018018018018018,
                "halfWidth": 0.39864864864864863
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                0,
                1072,
                187,
                262
              ],
              "ms": 145,
              "layout": {
                "ax": 102,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                1072,
                161,
                261
              ],
              "ms": 135,
              "layout": {
                "ax": 92,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                1072,
                182,
                262
              ],
              "ms": 145,
              "layout": {
                "ax": 87,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                1072,
                152,
                260
              ],
              "ms": 135,
              "layout": {
                "ax": 83,
                "ay": 258,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-walk",
              "rect": [
                0,
                1072,
                187,
                262
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 102,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                187,
                1072,
                161,
                261
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 92,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                374,
                1072,
                182,
                262
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 87,
                "ay": 259,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            },
            {
              "image": "second-walk",
              "rect": [
                561,
                1072,
                152,
                260
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 83,
                "ay": 258,
                "unit": 248,
                "above": 1.0443548387096775,
                "below": 0.012096774193548387,
                "halfWidth": 0.4112903225806452
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                1068,
                228,
                261
              ],
              "ms": 105,
              "layout": {
                "ax": 116,
                "ay": 255,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                1068,
                198,
                209
              ],
              "ms": 85,
              "layout": {
                "ax": 106,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                1068,
                227,
                259
              ],
              "ms": 105,
              "layout": {
                "ax": 113,
                "ay": 254,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                1068,
                205,
                210
              ],
              "ms": 85,
              "layout": {
                "ax": 111,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "second-run",
              "rect": [
                0,
                1068,
                228,
                261
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 116,
                "ay": 255,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                229,
                1068,
                198,
                209
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 106,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                458,
                1068,
                227,
                259
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 113,
                "ay": 254,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            },
            {
              "image": "second-run",
              "rect": [
                687,
                1068,
                205,
                210
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 111,
                "ay": 263,
                "unit": 247,
                "above": 1.0647773279352226,
                "below": 0.024291497975708502,
                "halfWidth": 0.46963562753036436
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "second-jump",
              "rect": [
                645,
                1040,
                201,
                219
              ],
              "ms": 230,
              "layout": {
                "ax": 110,
                "ay": 214,
                "unit": 205,
                "above": 1.0439024390243903,
                "below": 0.024390243902439025,
                "halfWidth": 0.5365853658536586
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                0,
                1012,
                226,
                243
              ],
              "ms": 165,
              "layout": {
                "ax": 116.5,
                "ay": 250,
                "unit": 232,
                "above": 1.0991379310344827,
                "below": 0,
                "halfWidth": 0.6487068965517241
              }
            },
            {
              "image": "g2-special",
              "rect": [
                256,
                1012,
                237,
                246
              ],
              "ms": 165,
              "layout": {
                "ax": 110.5,
                "ay": 252,
                "unit": 232,
                "above": 1.0991379310344827,
                "below": 0,
                "halfWidth": 0.6487068965517241
              }
            },
            {
              "image": "g2-special",
              "rect": [
                512,
                1012,
                256,
                241
              ],
              "ms": 165,
              "layout": {
                "ax": 105.5,
                "ay": 255,
                "unit": 232,
                "above": 1.0991379310344827,
                "below": 0,
                "halfWidth": 0.6487068965517241
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g2-special",
              "rect": [
                768,
                1012,
                186,
                247
              ],
              "ms": 160,
              "layout": {
                "ax": 50.5,
                "ay": 243,
                "unit": 239,
                "above": 1.0292887029288702,
                "below": 0.029288702928870293,
                "halfWidth": 0.5669456066945606
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                1012,
                173,
                252
              ],
              "ms": 160,
              "layout": {
                "ax": 56.5,
                "ay": 245,
                "unit": 239,
                "above": 1.0292887029288702,
                "below": 0.029288702928870293,
                "halfWidth": 0.5669456066945606
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1280,
                1012,
                175,
                253
              ],
              "ms": 160,
              "layout": {
                "ax": 62.5,
                "ay": 246,
                "unit": 239,
                "above": 1.0292887029288702,
                "below": 0.029288702928870293,
                "halfWidth": 0.5669456066945606
              }
            },
            {
              "image": "g2-special",
              "rect": [
                1024,
                1012,
                173,
                252
              ],
              "ms": 160,
              "layout": {
                "ax": 56.5,
                "ay": 245,
                "unit": 239,
                "above": 1.0292887029288702,
                "below": 0.029288702928870293,
                "halfWidth": 0.5669456066945606
              }
            }
          ]
        }
      }
    },
    "char_11": {
      "id": 11,
      "name": "قفزة",
      "original": "originals/char_11.png",
      "originalFilename": "11_Qafza_قفزة.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                0,
                186,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 91.5,
                "ay": 234,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                0,
                183,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 90.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                0,
                185,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 89.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                0,
                183,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 90.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                0,
                185,
                216
              ],
              "ms": 105,
              "layout": {
                "ax": 99.5,
                "ay": 225,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                0,
                184,
                217
              ],
              "ms": 105,
              "layout": {
                "ax": 98.5,
                "ay": 226,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                0,
                0,
                203,
                242
              ],
              "ms": 180,
              "layout": {
                "ax": 93.5,
                "ay": 232,
                "unit": 270,
                "above": 1.0925925925925926,
                "below": 0.037037037037037035,
                "halfWidth": 0.43148148148148147
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                241,
                0,
                210,
                284
              ],
              "ms": 100,
              "layout": {
                "ax": 104.5,
                "ay": 276,
                "unit": 270,
                "above": 1.0925925925925926,
                "below": 0.037037037037037035,
                "halfWidth": 0.43148148148148147
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                482,
                0,
                216,
                244
              ],
              "ms": 215,
              "layout": {
                "ax": 113,
                "ay": 295,
                "unit": 270,
                "above": 1.0925925925925926,
                "below": 0.037037037037037035,
                "halfWidth": 0.43148148148148147
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                723,
                0,
                210,
                249
              ],
              "ms": 160,
              "layout": {
                "ax": 116.5,
                "ay": 239,
                "unit": 270,
                "above": 1.0925925925925926,
                "below": 0.037037037037037035,
                "halfWidth": 0.43148148148148147
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                0,
                177,
                210
              ],
              "ms": 1000,
              "layout": {
                "ax": 95,
                "ay": 202,
                "unit": 196,
                "above": 1.0309278350515463,
                "below": 0.041237113402061855,
                "halfWidth": 0.5126903553299492
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                0,
                177,
                210
              ],
              "ms": 95,
              "layout": {
                "ax": 95,
                "ay": 202,
                "unit": 196,
                "above": 1.030612244897959,
                "below": 0.04081632653061224,
                "halfWidth": 0.5482233502538071
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                0,
                212,
                211
              ],
              "ms": 1050,
              "layout": {
                "ax": 108,
                "ay": 203,
                "unit": 197,
                "above": 1.030612244897959,
                "below": 0.04081632653061224,
                "halfWidth": 0.5482233502538071
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                0,
                177,
                210
              ],
              "ms": 120,
              "layout": {
                "ax": 82,
                "ay": 207,
                "unit": 196,
                "above": 1.0561224489795917,
                "below": 0.015306122448979591,
                "halfWidth": 0.5204081632653061
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                0,
                150,
                202
              ],
              "ms": 1100,
              "layout": {
                "ax": 48,
                "ay": 200,
                "unit": 196,
                "above": 1.0561224489795917,
                "below": 0.015306122448979591,
                "halfWidth": 0.5204081632653061
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                0,
                177,
                210
              ],
              "ms": 120,
              "layout": {
                "ax": 82,
                "ay": 207,
                "unit": 196,
                "above": 1.0561224489795917,
                "below": 0.015306122448979591,
                "halfWidth": 0.5255102040816326
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                0,
                181,
                209
              ],
              "ms": 1100,
              "layout": {
                "ax": 78,
                "ay": 207,
                "unit": 196,
                "above": 1.0561224489795917,
                "below": 0.015306122448979591,
                "halfWidth": 0.5255102040816326
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                0,
                177,
                210
              ],
              "ms": 160,
              "layout": {
                "ax": 95,
                "ay": 202,
                "unit": 196,
                "above": 1.0309278350515463,
                "below": 0.041237113402061855,
                "halfWidth": 0.5126903553299492
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                0,
                179,
                208
              ],
              "ms": 135,
              "layout": {
                "ax": 94,
                "ay": 200,
                "unit": 194,
                "above": 1.0309278350515463,
                "below": 0.041237113402061855,
                "halfWidth": 0.5126903553299492
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                1060,
                0,
                161,
                210
              ],
              "ms": 100,
              "layout": {
                "ax": 83,
                "ay": 202,
                "unit": 196,
                "above": 1.0309278350515463,
                "below": 0.041237113402061855,
                "halfWidth": 0.5126903553299492
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                227,
                193,
                211
              ],
              "ms": 145,
              "layout": {
                "ax": 101,
                "ay": 203,
                "unit": 197,
                "above": 1.0309278350515463,
                "below": 0.041237113402061855,
                "halfWidth": 0.5126903553299492
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                0,
                186,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 91.5,
                "ay": 234,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                0,
                183,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 90.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                0,
                185,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 89.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                0,
                183,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 90.5,
                "ay": 235,
                "unit": 230,
                "above": 1.0217391304347827,
                "below": 0.043478260869565216,
                "halfWidth": 0.4152173913043478
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                558,
                0,
                185,
                243
              ],
              "ms": 142,
              "layout": {
                "ax": 90.5,
                "ay": 235,
                "unit": 229,
                "above": 1.0262008733624455,
                "below": 0.034934497816593885,
                "halfWidth": 0.42139737991266374
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                0,
                181,
                242
              ],
              "ms": 116,
              "layout": {
                "ax": 86.5,
                "ay": 234,
                "unit": 229,
                "above": 1.0262008733624455,
                "below": 0.034934497816593885,
                "halfWidth": 0.42139737991266374
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                930,
                0,
                183,
                242
              ],
              "ms": 142,
              "layout": {
                "ax": 86.5,
                "ay": 234,
                "unit": 229,
                "above": 1.0262008733624455,
                "below": 0.034934497816593885,
                "halfWidth": 0.42139737991266374
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                0,
                181,
                242
              ],
              "ms": 116,
              "layout": {
                "ax": 86.5,
                "ay": 234,
                "unit": 229,
                "above": 1.0262008733624455,
                "below": 0.034934497816593885,
                "halfWidth": 0.42139737991266374
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                0,
                192,
                217
              ],
              "ms": 145,
              "layout": {
                "ax": 91.5,
                "ay": 226,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                0,
                171,
                220
              ],
              "ms": 135,
              "layout": {
                "ax": 94.5,
                "ay": 228,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                0,
                179,
                218
              ],
              "ms": 145,
              "layout": {
                "ax": 98.5,
                "ay": 227,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                0,
                171,
                220
              ],
              "ms": 135,
              "layout": {
                "ax": 94.5,
                "ay": 228,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                0,
                192,
                217
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 91.5,
                "ay": 226,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                0,
                171,
                220
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 94.5,
                "ay": 228,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                0,
                179,
                218
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 227,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                0,
                171,
                220
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 94.5,
                "ay": 228,
                "unit": 206,
                "above": 1.1067961165048543,
                "below": 0,
                "halfWidth": 0.4878640776699029
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                0,
                185,
                216
              ],
              "ms": 105,
              "layout": {
                "ax": 99.5,
                "ay": 225,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                0,
                184,
                217
              ],
              "ms": 105,
              "layout": {
                "ax": 98.5,
                "ay": 226,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                0,
                185,
                216
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 99.5,
                "ay": 225,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                0,
                184,
                217
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 226,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                0,
                190,
                185
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 233,
                "unit": 203,
                "above": 1.1477832512315271,
                "below": 0,
                "halfWidth": 0.49014778325123154
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                723,
                0,
                210,
                249
              ],
              "ms": 230,
              "layout": {
                "ax": 116.5,
                "ay": 239,
                "unit": 235,
                "above": 1.0170212765957447,
                "below": 0.0425531914893617,
                "halfWidth": 0.4957446808510638
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                0,
                0,
                189,
                207
              ],
              "ms": 165,
              "layout": {
                "ax": 79.5,
                "ay": 227,
                "unit": 193,
                "above": 1.1761658031088082,
                "below": 0,
                "halfWidth": 0.7642487046632125
              }
            },
            {
              "image": "g3-special",
              "rect": [
                235,
                0,
                209,
                202
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 223,
                "unit": 193,
                "above": 1.1761658031088082,
                "below": 0,
                "halfWidth": 0.7642487046632125
              }
            },
            {
              "image": "g3-special",
              "rect": [
                470,
                0,
                219,
                199
              ],
              "ms": 165,
              "layout": {
                "ax": 71.5,
                "ay": 226,
                "unit": 193,
                "above": 1.1761658031088082,
                "below": 0,
                "halfWidth": 0.7642487046632125
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                705,
                0,
                180,
                217
              ],
              "ms": 160,
              "layout": {
                "ax": 60.5,
                "ay": 210,
                "unit": 215,
                "above": 1.0511627906976744,
                "below": 0.03255813953488372,
                "halfWidth": 0.5558139534883721
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                0,
                176,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 59.5,
                "ay": 220,
                "unit": 215,
                "above": 1.0511627906976744,
                "below": 0.03255813953488372,
                "halfWidth": 0.5558139534883721
              }
            },
            {
              "image": "g3-special",
              "rect": [
                1175,
                0,
                169,
                229
              ],
              "ms": 160,
              "layout": {
                "ax": 65.5,
                "ay": 226,
                "unit": 215,
                "above": 1.0511627906976744,
                "below": 0.03255813953488372,
                "halfWidth": 0.5558139534883721
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                0,
                176,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 59.5,
                "ay": 220,
                "unit": 215,
                "above": 1.0511627906976744,
                "below": 0.03255813953488372,
                "halfWidth": 0.5558139534883721
              }
            }
          ]
        }
      }
    },
    "char_12": {
      "id": 12,
      "name": "بندق",
      "original": "originals/char_12.png",
      "originalFilename": "12_Bondoq_بندق.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                246,
                176,
                243
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 231,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                246,
                171,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 84.5,
                "ay": 233,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                246,
                171,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 85.5,
                "ay": 232,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                246,
                171,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 84.5,
                "ay": 233,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                248,
                187,
                214
              ],
              "ms": 105,
              "layout": {
                "ax": 82.5,
                "ay": 232,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                248,
                178,
                210
              ],
              "ms": 105,
              "layout": {
                "ax": 85.5,
                "ay": 233,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                964,
                0,
                212,
                226
              ],
              "ms": 180,
              "layout": {
                "ax": 95.5,
                "ay": 236,
                "unit": 255,
                "above": 1.184313725490196,
                "below": 0,
                "halfWidth": 0.4568627450980392
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                0,
                301,
                219,
                269
              ],
              "ms": 100,
              "layout": {
                "ax": 114.5,
                "ay": 288,
                "unit": 255,
                "above": 1.184313725490196,
                "below": 0,
                "halfWidth": 0.4568627450980392
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                241,
                301,
                224,
                246
              ],
              "ms": 215,
              "layout": {
                "ax": 116,
                "ay": 302,
                "unit": 255,
                "above": 1.184313725490196,
                "below": 0,
                "halfWidth": 0.4568627450980392
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                482,
                301,
                229,
                229
              ],
              "ms": 160,
              "layout": {
                "ax": 113.5,
                "ay": 237,
                "unit": 255,
                "above": 1.184313725490196,
                "below": 0,
                "halfWidth": 0.4568627450980392
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                227,
                178,
                203
              ],
              "ms": 1000,
              "layout": {
                "ax": 92,
                "ay": 195,
                "unit": 189,
                "above": 1.0319148936170213,
                "below": 0.0425531914893617,
                "halfWidth": 0.5368421052631579
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                227,
                178,
                203
              ],
              "ms": 95,
              "layout": {
                "ax": 92,
                "ay": 195,
                "unit": 189,
                "above": 1.0317460317460319,
                "below": 0.042328042328042326,
                "halfWidth": 0.5233160621761658
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                227,
                194,
                207
              ],
              "ms": 1050,
              "layout": {
                "ax": 101,
                "ay": 199,
                "unit": 193,
                "above": 1.0317460317460319,
                "below": 0.042328042328042326,
                "halfWidth": 0.5233160621761658
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                227,
                178,
                203
              ],
              "ms": 120,
              "layout": {
                "ax": 78,
                "ay": 212,
                "unit": 189,
                "above": 1.1216931216931216,
                "below": 0,
                "halfWidth": 0.5343915343915344
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                227,
                156,
                196
              ],
              "ms": 1100,
              "layout": {
                "ax": 55,
                "ay": 206,
                "unit": 189,
                "above": 1.1216931216931216,
                "below": 0,
                "halfWidth": 0.5343915343915344
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                227,
                178,
                203
              ],
              "ms": 120,
              "layout": {
                "ax": 78,
                "ay": 212,
                "unit": 189,
                "above": 1.1216931216931216,
                "below": 0,
                "halfWidth": 0.5608465608465608
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                227,
                185,
                202
              ],
              "ms": 1100,
              "layout": {
                "ax": 79,
                "ay": 212,
                "unit": 189,
                "above": 1.1216931216931216,
                "below": 0,
                "halfWidth": 0.5608465608465608
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                227,
                178,
                203
              ],
              "ms": 160,
              "layout": {
                "ax": 92,
                "ay": 195,
                "unit": 189,
                "above": 1.0319148936170213,
                "below": 0.0425531914893617,
                "halfWidth": 0.5368421052631579
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                1060,
                227,
                182,
                204
              ],
              "ms": 135,
              "layout": {
                "ax": 80,
                "ay": 196,
                "unit": 190,
                "above": 1.0319148936170213,
                "below": 0.0425531914893617,
                "halfWidth": 0.5368421052631579
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                454,
                133,
                202
              ],
              "ms": 100,
              "layout": {
                "ax": 63,
                "ay": 194,
                "unit": 188,
                "above": 1.0319148936170213,
                "below": 0.0425531914893617,
                "halfWidth": 0.5368421052631579
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                454,
                178,
                203
              ],
              "ms": 145,
              "layout": {
                "ax": 78,
                "ay": 195,
                "unit": 189,
                "above": 1.0319148936170213,
                "below": 0.0425531914893617,
                "halfWidth": 0.5368421052631579
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                246,
                176,
                243
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 231,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                246,
                171,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 84.5,
                "ay": 233,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                246,
                171,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 85.5,
                "ay": 232,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                246,
                171,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 84.5,
                "ay": 233,
                "unit": 230,
                "above": 1.0130434782608695,
                "below": 0.05217391304347826,
                "halfWidth": 0.3847826086956522
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                558,
                246,
                173,
                246
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 233,
                "unit": 232,
                "above": 1.0043103448275863,
                "below": 0.05603448275862069,
                "halfWidth": 0.3771551724137931
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                246,
                168,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 232,
                "unit": 232,
                "above": 1.0043103448275863,
                "below": 0.05603448275862069,
                "halfWidth": 0.3771551724137931
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                930,
                246,
                169,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 85.5,
                "ay": 231,
                "unit": 232,
                "above": 1.0043103448275863,
                "below": 0.05603448275862069,
                "halfWidth": 0.3771551724137931
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                246,
                168,
                243
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 232,
                "unit": 232,
                "above": 1.0043103448275863,
                "below": 0.05603448275862069,
                "halfWidth": 0.3771551724137931
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                248,
                189,
                221
              ],
              "ms": 145,
              "layout": {
                "ax": 86.5,
                "ay": 236,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                248,
                156,
                221
              ],
              "ms": 135,
              "layout": {
                "ax": 69.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                248,
                165,
                218
              ],
              "ms": 145,
              "layout": {
                "ax": 81.5,
                "ay": 236,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                248,
                156,
                221
              ],
              "ms": 135,
              "layout": {
                "ax": 69.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                248,
                189,
                221
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 86.5,
                "ay": 236,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                248,
                156,
                221
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 69.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                248,
                165,
                218
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 81.5,
                "ay": 236,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                248,
                156,
                221
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 69.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.49516908212560384
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                248,
                187,
                214
              ],
              "ms": 105,
              "layout": {
                "ax": 82.5,
                "ay": 232,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                248,
                178,
                210
              ],
              "ms": 105,
              "layout": {
                "ax": 85.5,
                "ay": 233,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                248,
                187,
                214
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 82.5,
                "ay": 232,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                248,
                178,
                210
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 85.5,
                "ay": 233,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                248,
                195,
                200
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 90.5,
                "ay": 245,
                "unit": 200,
                "above": 1.225,
                "below": 0,
                "halfWidth": 0.5225
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                482,
                301,
                229,
                229
              ],
              "ms": 230,
              "layout": {
                "ax": 113.5,
                "ay": 237,
                "unit": 215,
                "above": 1.1023255813953488,
                "below": 0,
                "halfWidth": 0.5372093023255814
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                0,
                243,
                216,
                209
              ],
              "ms": 165,
              "layout": {
                "ax": 87.5,
                "ay": 228,
                "unit": 195,
                "above": 1.1794871794871795,
                "below": 0,
                "halfWidth": 0.7512820512820513
              }
            },
            {
              "image": "g3-special",
              "rect": [
                235,
                243,
                212,
                206
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 226,
                "unit": 195,
                "above": 1.1794871794871795,
                "below": 0,
                "halfWidth": 0.7512820512820513
              }
            },
            {
              "image": "g3-special",
              "rect": [
                470,
                243,
                214,
                206
              ],
              "ms": 165,
              "layout": {
                "ax": 67.5,
                "ay": 230,
                "unit": 195,
                "above": 1.1794871794871795,
                "below": 0,
                "halfWidth": 0.7512820512820513
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                705,
                243,
                161,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 65.5,
                "ay": 219,
                "unit": 215,
                "above": 1.069767441860465,
                "below": 0,
                "halfWidth": 0.4441860465116279
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                243,
                159,
                226
              ],
              "ms": 160,
              "layout": {
                "ax": 70.5,
                "ay": 228,
                "unit": 215,
                "above": 1.069767441860465,
                "below": 0,
                "halfWidth": 0.4441860465116279
              }
            },
            {
              "image": "g3-special",
              "rect": [
                1175,
                243,
                153,
                229
              ],
              "ms": 160,
              "layout": {
                "ax": 70.5,
                "ay": 230,
                "unit": 215,
                "above": 1.069767441860465,
                "below": 0,
                "halfWidth": 0.4441860465116279
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                243,
                159,
                226
              ],
              "ms": 160,
              "layout": {
                "ax": 70.5,
                "ay": 228,
                "unit": 215,
                "above": 1.069767441860465,
                "below": 0,
                "halfWidth": 0.4441860465116279
              }
            }
          ]
        }
      }
    },
    "char_13": {
      "id": 13,
      "name": "مشمش",
      "original": "originals/char_13.png",
      "originalFilename": "13_Mishmish_مشمش.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                492,
                163,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 91.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                492,
                159,
                232
              ],
              "ms": 116,
              "layout": {
                "ax": 88.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                492,
                158,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                492,
                159,
                232
              ],
              "ms": 116,
              "layout": {
                "ax": 88.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                496,
                188,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 93.5,
                "ay": 245,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                496,
                194,
                223
              ],
              "ms": 105,
              "layout": {
                "ax": 98.5,
                "ay": 242,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                723,
                301,
                234,
                236
              ],
              "ms": 180,
              "layout": {
                "ax": 118.5,
                "ay": 257,
                "unit": 273,
                "above": 1.2087912087912087,
                "below": 0,
                "halfWidth": 0.4816849816849817
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                964,
                301,
                210,
                287
              ],
              "ms": 100,
              "layout": {
                "ax": 114.5,
                "ay": 310,
                "unit": 273,
                "above": 1.2087912087912087,
                "below": 0,
                "halfWidth": 0.4816849816849817
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                0,
                602,
                215,
                243
              ],
              "ms": 215,
              "layout": {
                "ax": 116,
                "ay": 330,
                "unit": 273,
                "above": 1.2087912087912087,
                "below": 0,
                "halfWidth": 0.4816849816849817
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                241,
                602,
                227,
                232
              ],
              "ms": 160,
              "layout": {
                "ax": 131.5,
                "ay": 252,
                "unit": 273,
                "above": 1.2087912087912087,
                "below": 0,
                "halfWidth": 0.4816849816849817
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                454,
                151,
                220
              ],
              "ms": 1000,
              "layout": {
                "ax": 93,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                454,
                151,
                220
              ],
              "ms": 95,
              "layout": {
                "ax": 93,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                454,
                165,
                221
              ],
              "ms": 1050,
              "layout": {
                "ax": 88,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                454,
                151,
                220
              ],
              "ms": 120,
              "layout": {
                "ax": 78,
                "ay": 224,
                "unit": 206,
                "above": 1.087378640776699,
                "below": 0,
                "halfWidth": 0.470873786407767
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                454,
                167,
                207
              ],
              "ms": 1100,
              "layout": {
                "ax": 70,
                "ay": 211,
                "unit": 206,
                "above": 1.087378640776699,
                "below": 0,
                "halfWidth": 0.470873786407767
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                454,
                151,
                220
              ],
              "ms": 120,
              "layout": {
                "ax": 78,
                "ay": 224,
                "unit": 207,
                "above": 1.0869565217391304,
                "below": 0,
                "halfWidth": 0.4396135265700483
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                1060,
                454,
                170,
                221
              ],
              "ms": 1100,
              "layout": {
                "ax": 79,
                "ay": 225,
                "unit": 207,
                "above": 1.0869565217391304,
                "below": 0,
                "halfWidth": 0.4396135265700483
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                454,
                151,
                220
              ],
              "ms": 160,
              "layout": {
                "ax": 93,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                681,
                172,
                221
              ],
              "ms": 135,
              "layout": {
                "ax": 92,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                681,
                141,
                222
              ],
              "ms": 100,
              "layout": {
                "ax": 86,
                "ay": 214,
                "unit": 208,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                681,
                165,
                221
              ],
              "ms": 145,
              "layout": {
                "ax": 92,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.45145631067961167
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                492,
                163,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 91.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                492,
                159,
                232
              ],
              "ms": 116,
              "layout": {
                "ax": 88.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                492,
                158,
                232
              ],
              "ms": 142,
              "layout": {
                "ax": 87.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                492,
                159,
                232
              ],
              "ms": 116,
              "layout": {
                "ax": 88.5,
                "ay": 228,
                "unit": 218,
                "above": 1.0458715596330275,
                "below": 0.01834862385321101,
                "halfWidth": 0.4197247706422018
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                558,
                492,
                152,
                231
              ],
              "ms": 142,
              "layout": {
                "ax": 67.5,
                "ay": 228,
                "unit": 217,
                "above": 1.0506912442396312,
                "below": 0.013824884792626729,
                "halfWidth": 0.39400921658986177
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                492,
                143,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 67.5,
                "ay": 228,
                "unit": 217,
                "above": 1.0506912442396312,
                "below": 0.013824884792626729,
                "halfWidth": 0.39400921658986177
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                930,
                492,
                153,
                231
              ],
              "ms": 142,
              "layout": {
                "ax": 67.5,
                "ay": 228,
                "unit": 217,
                "above": 1.0506912442396312,
                "below": 0.013824884792626729,
                "halfWidth": 0.39400921658986177
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                492,
                143,
                231
              ],
              "ms": 116,
              "layout": {
                "ax": 67.5,
                "ay": 228,
                "unit": 217,
                "above": 1.0506912442396312,
                "below": 0.013824884792626729,
                "halfWidth": 0.39400921658986177
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                496,
                182,
                232
              ],
              "ms": 145,
              "layout": {
                "ax": 91.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                496,
                163,
                235
              ],
              "ms": 135,
              "layout": {
                "ax": 83.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                496,
                182,
                231
              ],
              "ms": 145,
              "layout": {
                "ax": 93.5,
                "ay": 249,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                496,
                163,
                235
              ],
              "ms": 135,
              "layout": {
                "ax": 83.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                496,
                182,
                232
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 91.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                496,
                163,
                235
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 83.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                496,
                182,
                231
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 93.5,
                "ay": 249,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                496,
                163,
                235
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 83.5,
                "ay": 250,
                "unit": 221,
                "above": 1.1312217194570136,
                "below": 0,
                "halfWidth": 0.4230769230769231
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                496,
                188,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 93.5,
                "ay": 245,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                496,
                194,
                223
              ],
              "ms": 105,
              "layout": {
                "ax": 98.5,
                "ay": 242,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                496,
                188,
                224
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 93.5,
                "ay": 245,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                496,
                194,
                223
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 242,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                496,
                190,
                200
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 90.5,
                "ay": 250,
                "unit": 210,
                "above": 1.1904761904761905,
                "below": 0,
                "halfWidth": 0.4738095238095238
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                241,
                602,
                227,
                232
              ],
              "ms": 230,
              "layout": {
                "ax": 131.5,
                "ay": 252,
                "unit": 218,
                "above": 1.1559633027522935,
                "below": 0,
                "halfWidth": 0.6032110091743119
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                0,
                486,
                224,
                207
              ],
              "ms": 165,
              "layout": {
                "ax": 108.5,
                "ay": 235,
                "unit": 193,
                "above": 1.2538860103626943,
                "below": 0,
                "halfWidth": 0.7746113989637305
              }
            },
            {
              "image": "g3-special",
              "rect": [
                235,
                486,
                235,
                200
              ],
              "ms": 165,
              "layout": {
                "ax": 97.5,
                "ay": 238,
                "unit": 193,
                "above": 1.2538860103626943,
                "below": 0,
                "halfWidth": 0.7746113989637305
              }
            },
            {
              "image": "g3-special",
              "rect": [
                470,
                486,
                235,
                200
              ],
              "ms": 165,
              "layout": {
                "ax": 85.5,
                "ay": 242,
                "unit": 193,
                "above": 1.2538860103626943,
                "below": 0,
                "halfWidth": 0.7746113989637305
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                705,
                486,
                194,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 66.5,
                "ay": 227,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.6042654028436019
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                486,
                199,
                222
              ],
              "ms": 160,
              "layout": {
                "ax": 77.5,
                "ay": 229,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.6042654028436019
              }
            },
            {
              "image": "g3-special",
              "rect": [
                1175,
                486,
                180,
                225
              ],
              "ms": 160,
              "layout": {
                "ax": 71.5,
                "ay": 231,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.6042654028436019
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                486,
                199,
                222
              ],
              "ms": 160,
              "layout": {
                "ax": 77.5,
                "ay": 229,
                "unit": 211,
                "above": 1.09478672985782,
                "below": 0,
                "halfWidth": 0.6042654028436019
              }
            }
          ]
        }
      }
    },
    "char_14": {
      "id": 14,
      "name": "حكيم",
      "original": "originals/char_14.png",
      "originalFilename": "14_Hakeem_حكيم.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                738,
                154,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 79.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                738,
                149,
                238
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                738,
                148,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 71.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                738,
                149,
                238
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                744,
                193,
                233
              ],
              "ms": 105,
              "layout": {
                "ax": 99.5,
                "ay": 235,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                744,
                184,
                233
              ],
              "ms": 105,
              "layout": {
                "ax": 92.5,
                "ay": 236,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                482,
                602,
                237,
                251
              ],
              "ms": 180,
              "layout": {
                "ax": 112.5,
                "ay": 254,
                "unit": 287,
                "above": 1.1637630662020906,
                "below": 0,
                "halfWidth": 0.4721254355400697
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                723,
                602,
                207,
                301
              ],
              "ms": 100,
              "layout": {
                "ax": 114.5,
                "ay": 308,
                "unit": 287,
                "above": 1.1637630662020906,
                "below": 0,
                "halfWidth": 0.4721254355400697
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                964,
                602,
                220,
                259
              ],
              "ms": 215,
              "layout": {
                "ax": 120,
                "ay": 334,
                "unit": 287,
                "above": 1.1637630662020906,
                "below": 0,
                "halfWidth": 0.4721254355400697
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                0,
                903,
                241,
                258
              ],
              "ms": 160,
              "layout": {
                "ax": 135.5,
                "ay": 261,
                "unit": 287,
                "above": 1.1637630662020906,
                "below": 0,
                "halfWidth": 0.4721254355400697
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                681,
                143,
                222
              ],
              "ms": 1000,
              "layout": {
                "ax": 74,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4326923076923077
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                681,
                143,
                222
              ],
              "ms": 95,
              "layout": {
                "ax": 74,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4928909952606635
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                681,
                185,
                225
              ],
              "ms": 1050,
              "layout": {
                "ax": 104,
                "ay": 217,
                "unit": 211,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4928909952606635
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                681,
                143,
                222
              ],
              "ms": 120,
              "layout": {
                "ax": 58,
                "ay": 223,
                "unit": 208,
                "above": 1.0721153846153846,
                "below": 0,
                "halfWidth": 0.40865384615384615
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                1060,
                681,
                144,
                216
              ],
              "ms": 1100,
              "layout": {
                "ax": 70,
                "ay": 218,
                "unit": 208,
                "above": 1.0721153846153846,
                "below": 0,
                "halfWidth": 0.40865384615384615
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                681,
                143,
                222
              ],
              "ms": 120,
              "layout": {
                "ax": 58,
                "ay": 223,
                "unit": 208,
                "above": 1.0721153846153846,
                "below": 0,
                "halfWidth": 0.4519230769230769
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                908,
                164,
                221
              ],
              "ms": 1100,
              "layout": {
                "ax": 70,
                "ay": 222,
                "unit": 208,
                "above": 1.0721153846153846,
                "below": 0,
                "halfWidth": 0.4519230769230769
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                681,
                143,
                222
              ],
              "ms": 160,
              "layout": {
                "ax": 74,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4326923076923077
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                908,
                165,
                222
              ],
              "ms": 135,
              "layout": {
                "ax": 81,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4326923076923077
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                908,
                135,
                223
              ],
              "ms": 100,
              "layout": {
                "ax": 75,
                "ay": 215,
                "unit": 209,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4326923076923077
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                908,
                179,
                222
              ],
              "ms": 145,
              "layout": {
                "ax": 90,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.4326923076923077
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                738,
                154,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 79.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                738,
                149,
                238
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                738,
                148,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 71.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                738,
                149,
                238
              ],
              "ms": 116,
              "layout": {
                "ax": 73.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.3549107142857143
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                558,
                738,
                143,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 70.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.34151785714285715
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                738,
                142,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 67.5,
                "ay": 235,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.34151785714285715
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                930,
                738,
                142,
                238
              ],
              "ms": 142,
              "layout": {
                "ax": 65.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.34151785714285715
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                738,
                142,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 67.5,
                "ay": 235,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.008928571428571428,
                "halfWidth": 0.34151785714285715
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                744,
                190,
                241
              ],
              "ms": 145,
              "layout": {
                "ax": 91.5,
                "ay": 244,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                744,
                151,
                248
              ],
              "ms": 135,
              "layout": {
                "ax": 72.5,
                "ay": 248,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                744,
                183,
                242
              ],
              "ms": 145,
              "layout": {
                "ax": 98.5,
                "ay": 245,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                744,
                151,
                248
              ],
              "ms": 135,
              "layout": {
                "ax": 72.5,
                "ay": 248,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                744,
                190,
                241
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 91.5,
                "ay": 244,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                744,
                151,
                248
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 72.5,
                "ay": 248,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                744,
                183,
                242
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 98.5,
                "ay": 245,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                744,
                151,
                248
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 72.5,
                "ay": 248,
                "unit": 234,
                "above": 1.0598290598290598,
                "below": 0,
                "halfWidth": 0.42094017094017094
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                744,
                193,
                233
              ],
              "ms": 105,
              "layout": {
                "ax": 99.5,
                "ay": 235,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                744,
                184,
                233
              ],
              "ms": 105,
              "layout": {
                "ax": 92.5,
                "ay": 236,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                744,
                193,
                233
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 99.5,
                "ay": 235,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                744,
                184,
                233
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 92.5,
                "ay": 236,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                744,
                195,
                202
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 97.5,
                "ay": 251,
                "unit": 219,
                "above": 1.1461187214611872,
                "below": 0,
                "halfWidth": 0.454337899543379
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                0,
                903,
                241,
                258
              ],
              "ms": 230,
              "layout": {
                "ax": 135.5,
                "ay": 261,
                "unit": 244,
                "above": 1.069672131147541,
                "below": 0,
                "halfWidth": 0.555327868852459
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                0,
                729,
                233,
                214
              ],
              "ms": 165,
              "layout": {
                "ax": 99.5,
                "ay": 238,
                "unit": 200,
                "above": 1.235,
                "below": 0,
                "halfWidth": 0.7575
              }
            },
            {
              "image": "g3-special",
              "rect": [
                235,
                729,
                225,
                214
              ],
              "ms": 165,
              "layout": {
                "ax": 76.5,
                "ay": 242,
                "unit": 200,
                "above": 1.235,
                "below": 0,
                "halfWidth": 0.7575
              }
            },
            {
              "image": "g3-special",
              "rect": [
                470,
                729,
                218,
                212
              ],
              "ms": 165,
              "layout": {
                "ax": 66.5,
                "ay": 247,
                "unit": 200,
                "above": 1.235,
                "below": 0,
                "halfWidth": 0.7575
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                705,
                729,
                184,
                233
              ],
              "ms": 160,
              "layout": {
                "ax": 65.5,
                "ay": 234,
                "unit": 229,
                "above": 1.0655021834061136,
                "below": 0,
                "halfWidth": 0.517467248908297
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                729,
                171,
                240
              ],
              "ms": 160,
              "layout": {
                "ax": 67.5,
                "ay": 242,
                "unit": 229,
                "above": 1.0655021834061136,
                "below": 0,
                "halfWidth": 0.517467248908297
              }
            },
            {
              "image": "g3-special",
              "rect": [
                1175,
                729,
                163,
                243
              ],
              "ms": 160,
              "layout": {
                "ax": 72.5,
                "ay": 244,
                "unit": 229,
                "above": 1.0655021834061136,
                "below": 0,
                "halfWidth": 0.517467248908297
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                729,
                171,
                240
              ],
              "ms": 160,
              "layout": {
                "ax": 67.5,
                "ay": 242,
                "unit": 229,
                "above": 1.0655021834061136,
                "below": 0,
                "halfWidth": 0.517467248908297
              }
            }
          ]
        }
      }
    },
    "char_15": {
      "id": 15,
      "name": "نبض",
      "original": "originals/char_15.png",
      "originalFilename": "15_Nabd_نبض.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                0,
                138,
                215
              ],
              "ms": 142,
              "layout": {
                "ax": 67.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                0,
                137,
                208
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                0,
                137,
                213
              ],
              "ms": 142,
              "layout": {
                "ax": 72.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                0,
                137,
                208
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                0,
                150,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 61.5,
                "ay": 229,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                0,
                148,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 67.5,
                "ay": 226,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                0,
                0,
                185,
                248
              ],
              "ms": 180,
              "layout": {
                "ax": 77.5,
                "ay": 239,
                "unit": 264,
                "above": 1.0795454545454546,
                "below": 0.03409090909090909,
                "halfWidth": 0.42424242424242425
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                242,
                0,
                192,
                278
              ],
              "ms": 100,
              "layout": {
                "ax": 80,
                "ay": 272,
                "unit": 264,
                "above": 1.0795454545454546,
                "below": 0.03409090909090909,
                "halfWidth": 0.42424242424242425
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                484,
                0,
                194,
                257
              ],
              "ms": 215,
              "layout": {
                "ax": 90.5,
                "ay": 285,
                "unit": 264,
                "above": 1.0795454545454546,
                "below": 0.03409090909090909,
                "halfWidth": 0.42424242424242425
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                726,
                0,
                196,
                251
              ],
              "ms": 160,
              "layout": {
                "ax": 109,
                "ay": 243,
                "unit": 264,
                "above": 1.0795454545454546,
                "below": 0.03409090909090909,
                "halfWidth": 0.42424242424242425
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                0,
                127,
                221
              ],
              "ms": 1000,
              "layout": {
                "ax": 66,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3737864077669903
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                0,
                127,
                221
              ],
              "ms": 95,
              "layout": {
                "ax": 66,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3883495145631068
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                0,
                156,
                220
              ],
              "ms": 1050,
              "layout": {
                "ax": 76,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3883495145631068
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                0,
                127,
                221
              ],
              "ms": 120,
              "layout": {
                "ax": 32,
                "ay": 213,
                "unit": 207,
                "above": 1.0289855072463767,
                "below": 0.03864734299516908,
                "halfWidth": 0.45893719806763283
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                0,
                120,
                216
              ],
              "ms": 1100,
              "layout": {
                "ax": 51,
                "ay": 209,
                "unit": 207,
                "above": 1.0289855072463767,
                "below": 0.03864734299516908,
                "halfWidth": 0.45893719806763283
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                0,
                127,
                221
              ],
              "ms": 120,
              "layout": {
                "ax": 32,
                "ay": 213,
                "unit": 207,
                "above": 1.0289855072463767,
                "below": 0.03864734299516908,
                "halfWidth": 0.45893719806763283
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                0,
                150,
                221
              ],
              "ms": 1100,
              "layout": {
                "ax": 73,
                "ay": 213,
                "unit": 207,
                "above": 1.0289855072463767,
                "below": 0.03864734299516908,
                "halfWidth": 0.45893719806763283
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                0,
                127,
                221
              ],
              "ms": 160,
              "layout": {
                "ax": 66,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3737864077669903
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                0,
                142,
                220
              ],
              "ms": 135,
              "layout": {
                "ax": 65,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3737864077669903
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                970,
                0,
                120,
                220
              ],
              "ms": 100,
              "layout": {
                "ax": 64,
                "ay": 212,
                "unit": 206,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3737864077669903
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                223,
                139,
                221
              ],
              "ms": 145,
              "layout": {
                "ax": 66,
                "ay": 213,
                "unit": 207,
                "above": 1.029126213592233,
                "below": 0.038834951456310676,
                "halfWidth": 0.3737864077669903
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                0,
                138,
                215
              ],
              "ms": 142,
              "layout": {
                "ax": 67.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                0,
                137,
                208
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                0,
                137,
                213
              ],
              "ms": 142,
              "layout": {
                "ax": 72.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                0,
                137,
                208
              ],
              "ms": 116,
              "layout": {
                "ax": 68.5,
                "ay": 230,
                "unit": 201,
                "above": 1.144278606965174,
                "below": 0,
                "halfWidth": 0.36069651741293535
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                567,
                0,
                135,
                214
              ],
              "ms": 142,
              "layout": {
                "ax": 65.5,
                "ay": 231,
                "unit": 200,
                "above": 1.155,
                "below": 0,
                "halfWidth": 0.3475
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                0,
                129,
                212
              ],
              "ms": 116,
              "layout": {
                "ax": 64.5,
                "ay": 231,
                "unit": 200,
                "above": 1.155,
                "below": 0,
                "halfWidth": 0.3475
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                945,
                0,
                126,
                212
              ],
              "ms": 142,
              "layout": {
                "ax": 65.5,
                "ay": 231,
                "unit": 200,
                "above": 1.155,
                "below": 0,
                "halfWidth": 0.3475
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                0,
                129,
                212
              ],
              "ms": 116,
              "layout": {
                "ax": 64.5,
                "ay": 231,
                "unit": 200,
                "above": 1.155,
                "below": 0,
                "halfWidth": 0.3475
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                0,
                150,
                228
              ],
              "ms": 145,
              "layout": {
                "ax": 45.5,
                "ay": 230,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                0,
                132,
                229
              ],
              "ms": 135,
              "layout": {
                "ax": 38.5,
                "ay": 231,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                0,
                145,
                229
              ],
              "ms": 145,
              "layout": {
                "ax": 50.5,
                "ay": 230,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                0,
                132,
                229
              ],
              "ms": 135,
              "layout": {
                "ax": 38.5,
                "ay": 231,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                0,
                150,
                228
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 45.5,
                "ay": 230,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                0,
                132,
                229
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 38.5,
                "ay": 231,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                0,
                145,
                229
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 50.5,
                "ay": 230,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                0,
                132,
                229
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 38.5,
                "ay": 231,
                "unit": 215,
                "above": 1.0744186046511628,
                "below": 0,
                "halfWidth": 0.48604651162790696
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                0,
                150,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 61.5,
                "ay": 229,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                0,
                148,
                224
              ],
              "ms": 105,
              "layout": {
                "ax": 67.5,
                "ay": 226,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                0,
                150,
                224
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 61.5,
                "ay": 229,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                0,
                148,
                224
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 226,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                0,
                151,
                193
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.42142857142857143
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                726,
                0,
                196,
                251
              ],
              "ms": 230,
              "layout": {
                "ax": 109,
                "ay": 243,
                "unit": 237,
                "above": 1.0253164556962024,
                "below": 0.03375527426160337,
                "halfWidth": 0.459915611814346
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                0,
                0,
                175,
                199
              ],
              "ms": 165,
              "layout": {
                "ax": 66.5,
                "ay": 223,
                "unit": 191,
                "above": 1.1832460732984293,
                "below": 0,
                "halfWidth": 0.6361256544502618
              }
            },
            {
              "image": "g4-special",
              "rect": [
                230,
                0,
                193,
                205
              ],
              "ms": 165,
              "layout": {
                "ax": 71.5,
                "ay": 226,
                "unit": 191,
                "above": 1.1832460732984293,
                "below": 0,
                "halfWidth": 0.6361256544502618
              }
            },
            {
              "image": "g4-special",
              "rect": [
                460,
                0,
                186,
                187
              ],
              "ms": 165,
              "layout": {
                "ax": 73.5,
                "ay": 226,
                "unit": 191,
                "above": 1.1832460732984293,
                "below": 0,
                "halfWidth": 0.6361256544502618
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                690,
                0,
                160,
                228
              ],
              "ms": 160,
              "layout": {
                "ax": 80.5,
                "ay": 226,
                "unit": 214,
                "above": 1.0560747663551402,
                "below": 0.009345794392523364,
                "halfWidth": 0.4462616822429907
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                0,
                161,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 92.5,
                "ay": 221,
                "unit": 214,
                "above": 1.0560747663551402,
                "below": 0.009345794392523364,
                "halfWidth": 0.4462616822429907
              }
            },
            {
              "image": "g4-special",
              "rect": [
                1150,
                0,
                153,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 95.5,
                "ay": 216,
                "unit": 214,
                "above": 1.0560747663551402,
                "below": 0.009345794392523364,
                "halfWidth": 0.4462616822429907
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                0,
                161,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 92.5,
                "ay": 221,
                "unit": 214,
                "above": 1.0560747663551402,
                "below": 0.009345794392523364,
                "halfWidth": 0.4462616822429907
              }
            }
          ]
        }
      }
    },
    "char_16": {
      "id": 16,
      "name": "وميض",
      "original": "originals/char_16.png",
      "originalFilename": "16_Wameed_وميض.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                251,
                132,
                222
              ],
              "ms": 142,
              "layout": {
                "ax": 61.5,
                "ay": 249,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                251,
                132,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                251,
                132,
                223
              ],
              "ms": 142,
              "layout": {
                "ax": 68.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                251,
                132,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                246,
                149,
                220
              ],
              "ms": 105,
              "layout": {
                "ax": 60.5,
                "ay": 233,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                246,
                146,
                221
              ],
              "ms": 105,
              "layout": {
                "ax": 64.5,
                "ay": 229,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                968,
                0,
                183,
                257
              ],
              "ms": 180,
              "layout": {
                "ax": 76.5,
                "ay": 250,
                "unit": 268,
                "above": 1.0671641791044777,
                "below": 0.026119402985074626,
                "halfWidth": 0.43283582089552236
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                0,
                286,
                194,
                282
              ],
              "ms": 100,
              "layout": {
                "ax": 78,
                "ay": 276,
                "unit": 268,
                "above": 1.0671641791044777,
                "below": 0.026119402985074626,
                "halfWidth": 0.43283582089552236
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                242,
                286,
                184,
                251
              ],
              "ms": 215,
              "layout": {
                "ax": 79.5,
                "ay": 286,
                "unit": 268,
                "above": 1.0671641791044777,
                "below": 0.026119402985074626,
                "halfWidth": 0.43283582089552236
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                484,
                286,
                182,
                257
              ],
              "ms": 160,
              "layout": {
                "ax": 96,
                "ay": 251,
                "unit": 268,
                "above": 1.0671641791044777,
                "below": 0.026119402985074626,
                "halfWidth": 0.43283582089552236
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                223,
                133,
                218
              ],
              "ms": 1000,
              "layout": {
                "ax": 69,
                "ay": 210,
                "unit": 204,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.43349753694581283
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                223,
                133,
                218
              ],
              "ms": 95,
              "layout": {
                "ax": 69,
                "ay": 210,
                "unit": 204,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.3883495145631068
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                223,
                158,
                220
              ],
              "ms": 1050,
              "layout": {
                "ax": 80,
                "ay": 212,
                "unit": 206,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.3883495145631068
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                223,
                133,
                218
              ],
              "ms": 120,
              "layout": {
                "ax": 36,
                "ay": 211,
                "unit": 204,
                "above": 1.0343137254901962,
                "below": 0.03431372549019608,
                "halfWidth": 0.47549019607843135
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                223,
                125,
                216
              ],
              "ms": 1100,
              "layout": {
                "ax": 55,
                "ay": 209,
                "unit": 204,
                "above": 1.0343137254901962,
                "below": 0.03431372549019608,
                "halfWidth": 0.47549019607843135
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                223,
                133,
                218
              ],
              "ms": 120,
              "layout": {
                "ax": 36,
                "ay": 211,
                "unit": 206,
                "above": 1.0339805825242718,
                "below": 0.03398058252427184,
                "halfWidth": 0.470873786407767
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                223,
                157,
                220
              ],
              "ms": 1100,
              "layout": {
                "ax": 80,
                "ay": 213,
                "unit": 206,
                "above": 1.0339805825242718,
                "below": 0.03398058252427184,
                "halfWidth": 0.470873786407767
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                223,
                133,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 69,
                "ay": 210,
                "unit": 204,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.43349753694581283
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                970,
                223,
                158,
                217
              ],
              "ms": 135,
              "layout": {
                "ax": 70,
                "ay": 209,
                "unit": 203,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.43349753694581283
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                446,
                130,
                216
              ],
              "ms": 100,
              "layout": {
                "ax": 71,
                "ay": 208,
                "unit": 202,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.43349753694581283
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                446,
                145,
                217
              ],
              "ms": 145,
              "layout": {
                "ax": 65,
                "ay": 209,
                "unit": 203,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.43349753694581283
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                251,
                132,
                222
              ],
              "ms": 142,
              "layout": {
                "ax": 61.5,
                "ay": 249,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                251,
                132,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                251,
                132,
                223
              ],
              "ms": 142,
              "layout": {
                "ax": 68.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                251,
                132,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 250,
                "unit": 209,
                "above": 1.1961722488038278,
                "below": 0,
                "halfWidth": 0.3373205741626794
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                567,
                251,
                133,
                220
              ],
              "ms": 142,
              "layout": {
                "ax": 65.5,
                "ay": 249,
                "unit": 208,
                "above": 1.1971153846153846,
                "below": 0,
                "halfWidth": 0.3389423076923077
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                251,
                128,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 65.5,
                "ay": 249,
                "unit": 208,
                "above": 1.1971153846153846,
                "below": 0,
                "halfWidth": 0.3389423076923077
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                945,
                251,
                134,
                219
              ],
              "ms": 142,
              "layout": {
                "ax": 70.5,
                "ay": 249,
                "unit": 208,
                "above": 1.1971153846153846,
                "below": 0,
                "halfWidth": 0.3389423076923077
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                251,
                128,
                222
              ],
              "ms": 116,
              "layout": {
                "ax": 65.5,
                "ay": 249,
                "unit": 208,
                "above": 1.1971153846153846,
                "below": 0,
                "halfWidth": 0.3389423076923077
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                246,
                147,
                224
              ],
              "ms": 145,
              "layout": {
                "ax": 42.5,
                "ay": 231,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                246,
                130,
                224
              ],
              "ms": 135,
              "layout": {
                "ax": 39.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                246,
                142,
                222
              ],
              "ms": 145,
              "layout": {
                "ax": 46.5,
                "ay": 230,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                246,
                130,
                224
              ],
              "ms": 135,
              "layout": {
                "ax": 39.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                246,
                147,
                224
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 42.5,
                "ay": 231,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                246,
                130,
                224
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 39.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                246,
                142,
                222
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 46.5,
                "ay": 230,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                246,
                130,
                224
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 39.5,
                "ay": 232,
                "unit": 210,
                "above": 1.1047619047619048,
                "below": 0,
                "halfWidth": 0.4976190476190476
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                246,
                149,
                220
              ],
              "ms": 105,
              "layout": {
                "ax": 60.5,
                "ay": 233,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                246,
                146,
                221
              ],
              "ms": 105,
              "layout": {
                "ax": 64.5,
                "ay": 229,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                246,
                149,
                220
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 60.5,
                "ay": 233,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                246,
                146,
                221
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 64.5,
                "ay": 229,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                246,
                148,
                198
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 61.5,
                "ay": 237,
                "unit": 207,
                "above": 1.144927536231884,
                "below": 0,
                "halfWidth": 0.427536231884058
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                484,
                286,
                182,
                257
              ],
              "ms": 230,
              "layout": {
                "ax": 96,
                "ay": 251,
                "unit": 243,
                "above": 1.0329218106995885,
                "below": 0.024691358024691357,
                "halfWidth": 0.3950617283950617
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                0,
                239,
                160,
                214
              ],
              "ms": 165,
              "layout": {
                "ax": 65.5,
                "ay": 240,
                "unit": 200,
                "above": 1.215,
                "below": 0,
                "halfWidth": 0.6025
              }
            },
            {
              "image": "g4-special",
              "rect": [
                230,
                239,
                196,
                211
              ],
              "ms": 165,
              "layout": {
                "ax": 75.5,
                "ay": 241,
                "unit": 200,
                "above": 1.215,
                "below": 0,
                "halfWidth": 0.6025
              }
            },
            {
              "image": "g4-special",
              "rect": [
                460,
                239,
                193,
                207
              ],
              "ms": 165,
              "layout": {
                "ax": 82.5,
                "ay": 243,
                "unit": 200,
                "above": 1.215,
                "below": 0,
                "halfWidth": 0.6025
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                690,
                239,
                158,
                231
              ],
              "ms": 160,
              "layout": {
                "ax": 94.5,
                "ay": 234,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.49078341013824883
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                239,
                154,
                228
              ],
              "ms": 160,
              "layout": {
                "ax": 90.5,
                "ay": 231,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.49078341013824883
              }
            },
            {
              "image": "g4-special",
              "rect": [
                1150,
                239,
                150,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 106.5,
                "ay": 233,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.49078341013824883
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                239,
                154,
                228
              ],
              "ms": 160,
              "layout": {
                "ax": 90.5,
                "ay": 231,
                "unit": 217,
                "above": 1.0783410138248848,
                "below": 0,
                "halfWidth": 0.49078341013824883
              }
            }
          ]
        }
      }
    },
    "char_17": {
      "id": 17,
      "name": "شرارة",
      "original": "originals/char_17.png",
      "originalFilename": "17_Sharara_شرارة.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                502,
                188,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 94.5,
                "ay": 259,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                502,
                184,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 96.5,
                "ay": 258,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                502,
                189,
                234
              ],
              "ms": 142,
              "layout": {
                "ax": 100.5,
                "ay": 257,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                502,
                184,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 96.5,
                "ay": 258,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                492,
                168,
                211
              ],
              "ms": 105,
              "layout": {
                "ax": 79.5,
                "ay": 236,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                492,
                172,
                215
              ],
              "ms": 105,
              "layout": {
                "ax": 89.5,
                "ay": 232,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                726,
                286,
                231,
                248
              ],
              "ms": 180,
              "layout": {
                "ax": 116.5,
                "ay": 241,
                "unit": 272,
                "above": 1.0808823529411764,
                "below": 0.025735294117647058,
                "halfWidth": 0.5
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                968,
                286,
                231,
                286
              ],
              "ms": 100,
              "layout": {
                "ax": 123,
                "ay": 281,
                "unit": 272,
                "above": 1.0808823529411764,
                "below": 0.025735294117647058,
                "halfWidth": 0.5
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                0,
                572,
                229,
                258
              ],
              "ms": 215,
              "layout": {
                "ax": 133.5,
                "ay": 294,
                "unit": 272,
                "above": 1.0808823529411764,
                "below": 0.025735294117647058,
                "halfWidth": 0.5
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                242,
                572,
                242,
                244
              ],
              "ms": 160,
              "layout": {
                "ax": 136,
                "ay": 239,
                "unit": 272,
                "above": 1.0808823529411764,
                "below": 0.025735294117647058,
                "halfWidth": 0.5
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                446,
                177,
                218
              ],
              "ms": 1000,
              "layout": {
                "ax": 105,
                "ay": 210,
                "unit": 204,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.5490196078431373
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                446,
                177,
                218
              ],
              "ms": 95,
              "layout": {
                "ax": 105,
                "ay": 210,
                "unit": 204,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.5147058823529411
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                446,
                163,
                216
              ],
              "ms": 1050,
              "layout": {
                "ax": 84,
                "ay": 208,
                "unit": 202,
                "above": 1.0297029702970297,
                "below": 0.039603960396039604,
                "halfWidth": 0.5147058823529411
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                446,
                177,
                218
              ],
              "ms": 120,
              "layout": {
                "ax": 65,
                "ay": 211,
                "unit": 204,
                "above": 1.0343137254901962,
                "below": 0.03431372549019608,
                "halfWidth": 0.5490196078431373
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                446,
                157,
                213
              ],
              "ms": 1100,
              "layout": {
                "ax": 75,
                "ay": 207,
                "unit": 204,
                "above": 1.0343137254901962,
                "below": 0.03431372549019608,
                "halfWidth": 0.5490196078431373
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                446,
                177,
                218
              ],
              "ms": 120,
              "layout": {
                "ax": 65,
                "ay": 211,
                "unit": 205,
                "above": 1.0341463414634147,
                "below": 0.03414634146341464,
                "halfWidth": 0.5463414634146342
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                970,
                446,
                182,
                219
              ],
              "ms": 1100,
              "layout": {
                "ax": 102,
                "ay": 212,
                "unit": 205,
                "above": 1.0341463414634147,
                "below": 0.03414634146341464,
                "halfWidth": 0.5463414634146342
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                446,
                177,
                218
              ],
              "ms": 160,
              "layout": {
                "ax": 105,
                "ay": 210,
                "unit": 204,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.5490196078431373
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                669,
                194,
                218
              ],
              "ms": 135,
              "layout": {
                "ax": 112,
                "ay": 210,
                "unit": 204,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.5490196078431373
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                669,
                165,
                219
              ],
              "ms": 100,
              "layout": {
                "ax": 95,
                "ay": 211,
                "unit": 205,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.5490196078431373
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                669,
                177,
                218
              ],
              "ms": 145,
              "layout": {
                "ax": 96,
                "ay": 210,
                "unit": 204,
                "above": 1.0294117647058822,
                "below": 0.0392156862745098,
                "halfWidth": 0.5490196078431373
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                502,
                188,
                236
              ],
              "ms": 142,
              "layout": {
                "ax": 94.5,
                "ay": 259,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                502,
                184,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 96.5,
                "ay": 258,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                502,
                189,
                234
              ],
              "ms": 142,
              "layout": {
                "ax": 100.5,
                "ay": 257,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                502,
                184,
                234
              ],
              "ms": 116,
              "layout": {
                "ax": 96.5,
                "ay": 258,
                "unit": 222,
                "above": 1.1666666666666667,
                "below": 0,
                "halfWidth": 0.4527027027027027
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                567,
                502,
                186,
                235
              ],
              "ms": 142,
              "layout": {
                "ax": 93.5,
                "ay": 259,
                "unit": 223,
                "above": 1.1748878923766817,
                "below": 0,
                "halfWidth": 0.42376681614349776
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                502,
                183,
                233
              ],
              "ms": 116,
              "layout": {
                "ax": 93.5,
                "ay": 259,
                "unit": 223,
                "above": 1.1748878923766817,
                "below": 0,
                "halfWidth": 0.42376681614349776
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                945,
                502,
                187,
                237
              ],
              "ms": 142,
              "layout": {
                "ax": 94.5,
                "ay": 262,
                "unit": 223,
                "above": 1.1748878923766817,
                "below": 0,
                "halfWidth": 0.42376681614349776
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                502,
                183,
                233
              ],
              "ms": 116,
              "layout": {
                "ax": 93.5,
                "ay": 259,
                "unit": 223,
                "above": 1.1748878923766817,
                "below": 0,
                "halfWidth": 0.42376681614349776
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                492,
                169,
                220
              ],
              "ms": 145,
              "layout": {
                "ax": 77.5,
                "ay": 238,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                492,
                158,
                223
              ],
              "ms": 135,
              "layout": {
                "ax": 67.5,
                "ay": 240,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                492,
                177,
                223
              ],
              "ms": 145,
              "layout": {
                "ax": 80.5,
                "ay": 241,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                492,
                158,
                223
              ],
              "ms": 135,
              "layout": {
                "ax": 67.5,
                "ay": 240,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                492,
                169,
                220
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 77.5,
                "ay": 238,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                492,
                158,
                223
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 240,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                492,
                177,
                223
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 80.5,
                "ay": 241,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                492,
                158,
                223
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 240,
                "unit": 209,
                "above": 1.1531100478468899,
                "below": 0,
                "halfWidth": 0.46172248803827753
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                492,
                168,
                211
              ],
              "ms": 105,
              "layout": {
                "ax": 79.5,
                "ay": 236,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                492,
                172,
                215
              ],
              "ms": 105,
              "layout": {
                "ax": 89.5,
                "ay": 232,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                492,
                168,
                211
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 79.5,
                "ay": 236,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                492,
                172,
                215
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 89.5,
                "ay": 232,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                492,
                177,
                192
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 86.5,
                "ay": 242,
                "unit": 201,
                "above": 1.2039800995024876,
                "below": 0,
                "halfWidth": 0.4502487562189055
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                242,
                572,
                242,
                244
              ],
              "ms": 230,
              "layout": {
                "ax": 136,
                "ay": 239,
                "unit": 230,
                "above": 1.0391304347826087,
                "below": 0.021739130434782608,
                "halfWidth": 0.591304347826087
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                0,
                478,
                212,
                221
              ],
              "ms": 165,
              "layout": {
                "ax": 98.5,
                "ay": 241,
                "unit": 209,
                "above": 1.1626794258373205,
                "below": 0,
                "halfWidth": 0.562200956937799
              }
            },
            {
              "image": "g4-special",
              "rect": [
                230,
                478,
                221,
                222
              ],
              "ms": 165,
              "layout": {
                "ax": 103.5,
                "ay": 243,
                "unit": 209,
                "above": 1.1626794258373205,
                "below": 0,
                "halfWidth": 0.562200956937799
              }
            },
            {
              "image": "g4-special",
              "rect": [
                460,
                478,
                230,
                223
              ],
              "ms": 165,
              "layout": {
                "ax": 116.5,
                "ay": 243,
                "unit": 209,
                "above": 1.1626794258373205,
                "below": 0,
                "halfWidth": 0.562200956937799
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                690,
                478,
                186,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 101.5,
                "ay": 236,
                "unit": 218,
                "above": 1.091743119266055,
                "below": 0,
                "halfWidth": 0.5298165137614679
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                478,
                173,
                232
              ],
              "ms": 160,
              "layout": {
                "ax": 108.5,
                "ay": 236,
                "unit": 218,
                "above": 1.091743119266055,
                "below": 0,
                "halfWidth": 0.5298165137614679
              }
            },
            {
              "image": "g4-special",
              "rect": [
                1150,
                478,
                190,
                230
              ],
              "ms": 160,
              "layout": {
                "ax": 115.5,
                "ay": 238,
                "unit": 218,
                "above": 1.091743119266055,
                "below": 0,
                "halfWidth": 0.5298165137614679
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                478,
                173,
                232
              ],
              "ms": 160,
              "layout": {
                "ax": 108.5,
                "ay": 236,
                "unit": 218,
                "above": 1.091743119266055,
                "below": 0,
                "halfWidth": 0.5298165137614679
              }
            }
          ]
        }
      }
    },
    "char_18": {
      "id": 18,
      "name": "غيمة",
      "original": "originals/char_18.png",
      "originalFilename": "18_Ghaima_غيمة.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                753,
                167,
                223
              ],
              "ms": 142,
              "layout": {
                "ax": 84.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                753,
                166,
                223
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                753,
                166,
                220
              ],
              "ms": 142,
              "layout": {
                "ax": 84.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                753,
                166,
                223
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                738,
                162,
                217
              ],
              "ms": 105,
              "layout": {
                "ax": 62.5,
                "ay": 243,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                738,
                165,
                218
              ],
              "ms": 105,
              "layout": {
                "ax": 76.5,
                "ay": 239,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                484,
                572,
                205,
                247
              ],
              "ms": 180,
              "layout": {
                "ax": 94.5,
                "ay": 248,
                "unit": 267,
                "above": 1.1310861423220975,
                "below": 0,
                "halfWidth": 0.45692883895131087
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                726,
                572,
                194,
                281
              ],
              "ms": 100,
              "layout": {
                "ax": 93,
                "ay": 284,
                "unit": 267,
                "above": 1.1310861423220975,
                "below": 0,
                "halfWidth": 0.45692883895131087
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                968,
                572,
                196,
                241
              ],
              "ms": 215,
              "layout": {
                "ax": 114.5,
                "ay": 302,
                "unit": 267,
                "above": 1.1310861423220975,
                "below": 0,
                "halfWidth": 0.45692883895131087
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                0,
                858,
                217,
                249
              ],
              "ms": 160,
              "layout": {
                "ax": 122,
                "ay": 250,
                "unit": 267,
                "above": 1.1310861423220975,
                "below": 0,
                "halfWidth": 0.45692883895131087
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                669,
                164,
                211
              ],
              "ms": 1000,
              "layout": {
                "ax": 88,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                669,
                164,
                211
              ],
              "ms": 95,
              "layout": {
                "ax": 88,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                669,
                163,
                211
              ],
              "ms": 1050,
              "layout": {
                "ax": 84,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                669,
                164,
                211
              ],
              "ms": 120,
              "layout": {
                "ax": 52,
                "ay": 215,
                "unit": 197,
                "above": 1.0913705583756346,
                "below": 0,
                "halfWidth": 0.5685279187817259
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                970,
                669,
                152,
                209
              ],
              "ms": 1100,
              "layout": {
                "ax": 70,
                "ay": 213,
                "unit": 197,
                "above": 1.0913705583756346,
                "below": 0,
                "halfWidth": 0.5685279187817259
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                669,
                164,
                211
              ],
              "ms": 120,
              "layout": {
                "ax": 52,
                "ay": 215,
                "unit": 197,
                "above": 1.0913705583756346,
                "below": 0,
                "halfWidth": 0.5685279187817259
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                892,
                172,
                211
              ],
              "ms": 1100,
              "layout": {
                "ax": 94,
                "ay": 215,
                "unit": 197,
                "above": 1.0913705583756346,
                "below": 0,
                "halfWidth": 0.5685279187817259
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                669,
                164,
                211
              ],
              "ms": 160,
              "layout": {
                "ax": 88,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                892,
                166,
                211
              ],
              "ms": 135,
              "layout": {
                "ax": 84,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                892,
                157,
                211
              ],
              "ms": 100,
              "layout": {
                "ax": 84,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                892,
                164,
                211
              ],
              "ms": 145,
              "layout": {
                "ax": 84,
                "ay": 203,
                "unit": 197,
                "above": 1.0304568527918783,
                "below": 0.04060913705583756,
                "halfWidth": 0.4467005076142132
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                753,
                167,
                223
              ],
              "ms": 142,
              "layout": {
                "ax": 84.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                753,
                166,
                223
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                753,
                166,
                220
              ],
              "ms": 142,
              "layout": {
                "ax": 84.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                753,
                166,
                223
              ],
              "ms": 116,
              "layout": {
                "ax": 83.5,
                "ay": 254,
                "unit": 209,
                "above": 1.215311004784689,
                "below": 0,
                "halfWidth": 0.4043062200956938
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                567,
                753,
                165,
                219
              ],
              "ms": 142,
              "layout": {
                "ax": 82.5,
                "ay": 254,
                "unit": 205,
                "above": 1.2390243902439024,
                "below": 0,
                "halfWidth": 0.4024390243902439
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                753,
                163,
                219
              ],
              "ms": 116,
              "layout": {
                "ax": 82.5,
                "ay": 254,
                "unit": 205,
                "above": 1.2390243902439024,
                "below": 0,
                "halfWidth": 0.4024390243902439
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                945,
                753,
                165,
                219
              ],
              "ms": 142,
              "layout": {
                "ax": 82.5,
                "ay": 254,
                "unit": 205,
                "above": 1.2390243902439024,
                "below": 0,
                "halfWidth": 0.4024390243902439
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                753,
                163,
                219
              ],
              "ms": 116,
              "layout": {
                "ax": 82.5,
                "ay": 254,
                "unit": 205,
                "above": 1.2390243902439024,
                "below": 0,
                "halfWidth": 0.4024390243902439
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                738,
                169,
                223
              ],
              "ms": 145,
              "layout": {
                "ax": 67.5,
                "ay": 242,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                738,
                165,
                224
              ],
              "ms": 135,
              "layout": {
                "ax": 64.5,
                "ay": 244,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                738,
                164,
                220
              ],
              "ms": 145,
              "layout": {
                "ax": 75.5,
                "ay": 241,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                738,
                165,
                224
              ],
              "ms": 135,
              "layout": {
                "ax": 64.5,
                "ay": 244,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                738,
                169,
                223
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 242,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                738,
                165,
                224
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 64.5,
                "ay": 244,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                738,
                164,
                220
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 75.5,
                "ay": 241,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                738,
                165,
                224
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 64.5,
                "ay": 244,
                "unit": 210,
                "above": 1.161904761904762,
                "below": 0,
                "halfWidth": 0.48333333333333334
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                738,
                162,
                217
              ],
              "ms": 105,
              "layout": {
                "ax": 62.5,
                "ay": 243,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                738,
                165,
                218
              ],
              "ms": 105,
              "layout": {
                "ax": 76.5,
                "ay": 239,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                738,
                162,
                217
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 62.5,
                "ay": 243,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                738,
                165,
                218
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 76.5,
                "ay": 239,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                738,
                160,
                192
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 68.5,
                "ay": 248,
                "unit": 204,
                "above": 1.2156862745098038,
                "below": 0,
                "halfWidth": 0.4877450980392157
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                0,
                858,
                217,
                249
              ],
              "ms": 230,
              "layout": {
                "ax": 122,
                "ay": 250,
                "unit": 235,
                "above": 1.0638297872340425,
                "below": 0,
                "halfWidth": 0.5191489361702127
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                0,
                717,
                185,
                215
              ],
              "ms": 165,
              "layout": {
                "ax": 73.5,
                "ay": 240,
                "unit": 201,
                "above": 1.2388059701492538,
                "below": 0,
                "halfWidth": 0.554726368159204
              }
            },
            {
              "image": "g4-special",
              "rect": [
                230,
                717,
                187,
                211
              ],
              "ms": 165,
              "layout": {
                "ax": 78.5,
                "ay": 245,
                "unit": 201,
                "above": 1.2388059701492538,
                "below": 0,
                "halfWidth": 0.554726368159204
              }
            },
            {
              "image": "g4-special",
              "rect": [
                460,
                717,
                186,
                206
              ],
              "ms": 165,
              "layout": {
                "ax": 83.5,
                "ay": 249,
                "unit": 201,
                "above": 1.2388059701492538,
                "below": 0,
                "halfWidth": 0.554726368159204
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                690,
                717,
                171,
                233
              ],
              "ms": 160,
              "layout": {
                "ax": 94.5,
                "ay": 238,
                "unit": 225,
                "above": 1.0844444444444445,
                "below": 0,
                "halfWidth": 0.46
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                717,
                160,
                238
              ],
              "ms": 160,
              "layout": {
                "ax": 91.5,
                "ay": 238,
                "unit": 225,
                "above": 1.0844444444444445,
                "below": 0,
                "halfWidth": 0.46
              }
            },
            {
              "image": "g4-special",
              "rect": [
                1150,
                717,
                174,
                239
              ],
              "ms": 160,
              "layout": {
                "ax": 103.5,
                "ay": 244,
                "unit": 225,
                "above": 1.0844444444444445,
                "below": 0,
                "halfWidth": 0.46
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                717,
                160,
                238
              ],
              "ms": 160,
              "layout": {
                "ax": 91.5,
                "ay": 238,
                "unit": 225,
                "above": 1.0844444444444445,
                "below": 0,
                "halfWidth": 0.46
              }
            }
          ]
        }
      }
    },
    "char_19": {
      "id": 19,
      "name": "نجم",
      "original": "originals/char_19.png",
      "originalFilename": "19_Najm_نجم.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                1004,
                164,
                249
              ],
              "ms": 142,
              "layout": {
                "ax": 83.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                1004,
                156,
                249
              ],
              "ms": 116,
              "layout": {
                "ax": 79.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                1004,
                158,
                251
              ],
              "ms": 142,
              "layout": {
                "ax": 81.5,
                "ay": 262,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                1004,
                156,
                249
              ],
              "ms": 116,
              "layout": {
                "ax": 79.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                984,
                163,
                246
              ],
              "ms": 105,
              "layout": {
                "ax": 67.5,
                "ay": 250,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                984,
                161,
                246
              ],
              "ms": 105,
              "layout": {
                "ax": 75.5,
                "ay": 247,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                242,
                858,
                199,
                241
              ],
              "ms": 180,
              "layout": {
                "ax": 92.5,
                "ay": 237,
                "unit": 272,
                "above": 1.1066176470588236,
                "below": 0.014705882352941176,
                "halfWidth": 0.4338235294117647
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                484,
                858,
                205,
                286
              ],
              "ms": 100,
              "layout": {
                "ax": 100,
                "ay": 283,
                "unit": 272,
                "above": 1.1066176470588236,
                "below": 0.014705882352941176,
                "halfWidth": 0.4338235294117647
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                726,
                858,
                199,
                247
              ],
              "ms": 215,
              "layout": {
                "ax": 109.5,
                "ay": 301,
                "unit": 272,
                "above": 1.1066176470588236,
                "below": 0.014705882352941176,
                "halfWidth": 0.4338235294117647
              }
            },
            {
              "image": "third-b-jump",
              "rect": [
                968,
                858,
                199,
                247
              ],
              "ms": 160,
              "layout": {
                "ax": 118,
                "ay": 243,
                "unit": 272,
                "above": 1.1066176470588236,
                "below": 0.014705882352941176,
                "halfWidth": 0.4338235294117647
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                892,
                139,
                223
              ],
              "ms": 1000,
              "layout": {
                "ax": 75,
                "ay": 215,
                "unit": 209,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.41626794258373206
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                892,
                139,
                223
              ],
              "ms": 95,
              "layout": {
                "ax": 75,
                "ay": 215,
                "unit": 209,
                "above": 1.0287081339712918,
                "below": 0.03827751196172249,
                "halfWidth": 0.36363636363636365
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                970,
                892,
                152,
                223
              ],
              "ms": 1050,
              "layout": {
                "ax": 76,
                "ay": 215,
                "unit": 209,
                "above": 1.0287081339712918,
                "below": 0.03827751196172249,
                "halfWidth": 0.36363636363636365
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                892,
                139,
                223
              ],
              "ms": 120,
              "layout": {
                "ax": 45,
                "ay": 224,
                "unit": 209,
                "above": 1.0717703349282297,
                "below": 0,
                "halfWidth": 0.44976076555023925
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                0,
                1115,
                138,
                220
              ],
              "ms": 1100,
              "layout": {
                "ax": 64,
                "ay": 221,
                "unit": 209,
                "above": 1.0717703349282297,
                "below": 0,
                "halfWidth": 0.44976076555023925
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                892,
                139,
                223
              ],
              "ms": 120,
              "layout": {
                "ax": 45,
                "ay": 224,
                "unit": 209,
                "above": 1.0717703349282297,
                "below": 0,
                "halfWidth": 0.44976076555023925
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                194,
                1115,
                161,
                222
              ],
              "ms": 1100,
              "layout": {
                "ax": 84,
                "ay": 223,
                "unit": 209,
                "above": 1.0717703349282297,
                "below": 0,
                "halfWidth": 0.44976076555023925
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                892,
                139,
                223
              ],
              "ms": 160,
              "layout": {
                "ax": 75,
                "ay": 215,
                "unit": 209,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.41626794258373206
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                388,
                1115,
                168,
                223
              ],
              "ms": 135,
              "layout": {
                "ax": 81,
                "ay": 215,
                "unit": 209,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.41626794258373206
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                582,
                1115,
                136,
                222
              ],
              "ms": 100,
              "layout": {
                "ax": 73,
                "ay": 214,
                "unit": 208,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.41626794258373206
              }
            },
            {
              "image": "third-b-reactions",
              "rect": [
                776,
                1115,
                155,
                223
              ],
              "ms": 145,
              "layout": {
                "ax": 75,
                "ay": 215,
                "unit": 209,
                "above": 1.0288461538461537,
                "below": 0.038461538461538464,
                "halfWidth": 0.41626794258373206
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                0,
                1004,
                164,
                249
              ],
              "ms": 142,
              "layout": {
                "ax": 83.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                1004,
                156,
                249
              ],
              "ms": 116,
              "layout": {
                "ax": 79.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                378,
                1004,
                158,
                251
              ],
              "ms": 142,
              "layout": {
                "ax": 81.5,
                "ay": 262,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                189,
                1004,
                156,
                249
              ],
              "ms": 116,
              "layout": {
                "ax": 79.5,
                "ay": 260,
                "unit": 237,
                "above": 1.1054852320675106,
                "below": 0,
                "halfWidth": 0.35232067510548526
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g4-direction",
              "rect": [
                567,
                1004,
                158,
                248
              ],
              "ms": 142,
              "layout": {
                "ax": 81.5,
                "ay": 259,
                "unit": 234,
                "above": 1.106837606837607,
                "below": 0,
                "halfWidth": 0.3482905982905983
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                1004,
                157,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 80.5,
                "ay": 259,
                "unit": 234,
                "above": 1.106837606837607,
                "below": 0,
                "halfWidth": 0.3482905982905983
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                945,
                1004,
                159,
                245
              ],
              "ms": 142,
              "layout": {
                "ax": 79.5,
                "ay": 258,
                "unit": 234,
                "above": 1.106837606837607,
                "below": 0,
                "halfWidth": 0.3482905982905983
              }
            },
            {
              "image": "g4-direction",
              "rect": [
                756,
                1004,
                157,
                247
              ],
              "ms": 116,
              "layout": {
                "ax": 80.5,
                "ay": 259,
                "unit": 234,
                "above": 1.106837606837607,
                "below": 0,
                "halfWidth": 0.3482905982905983
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                984,
                166,
                246
              ],
              "ms": 145,
              "layout": {
                "ax": 66.5,
                "ay": 247,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                984,
                160,
                245
              ],
              "ms": 135,
              "layout": {
                "ax": 63.5,
                "ay": 249,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                984,
                162,
                241
              ],
              "ms": 145,
              "layout": {
                "ax": 75.5,
                "ay": 245,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                984,
                160,
                245
              ],
              "ms": 135,
              "layout": {
                "ax": 63.5,
                "ay": 249,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                531,
                984,
                166,
                246
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 66.5,
                "ay": 247,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                984,
                160,
                245
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 63.5,
                "ay": 249,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                885,
                984,
                162,
                241
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 75.5,
                "ay": 245,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                708,
                984,
                160,
                245
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 63.5,
                "ay": 249,
                "unit": 232,
                "above": 1.0732758620689655,
                "below": 0,
                "halfWidth": 0.42887931034482757
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                984,
                163,
                246
              ],
              "ms": 105,
              "layout": {
                "ax": 67.5,
                "ay": 250,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                984,
                161,
                246
              ],
              "ms": 105,
              "layout": {
                "ax": 75.5,
                "ay": 247,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-b-travel",
              "rect": [
                0,
                984,
                163,
                246
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 67.5,
                "ay": 250,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                354,
                984,
                161,
                246
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 75.5,
                "ay": 247,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            },
            {
              "image": "third-b-travel",
              "rect": [
                177,
                984,
                160,
                211
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 71.5,
                "ay": 256,
                "unit": 232,
                "above": 1.103448275862069,
                "below": 0,
                "halfWidth": 0.41163793103448276
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-b-jump",
              "rect": [
                968,
                858,
                199,
                247
              ],
              "ms": 230,
              "layout": {
                "ax": 118,
                "ay": 243,
                "unit": 233,
                "above": 1.0429184549356223,
                "below": 0.017167381974248927,
                "halfWidth": 0.5064377682403434
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                0,
                956,
                168,
                229
              ],
              "ms": 165,
              "layout": {
                "ax": 67.5,
                "ay": 243,
                "unit": 215,
                "above": 1.158139534883721,
                "below": 0,
                "halfWidth": 0.5325581395348837
              }
            },
            {
              "image": "g4-special",
              "rect": [
                230,
                956,
                181,
                228
              ],
              "ms": 165,
              "layout": {
                "ax": 71.5,
                "ay": 243,
                "unit": 215,
                "above": 1.158139534883721,
                "below": 0,
                "halfWidth": 0.5325581395348837
              }
            },
            {
              "image": "g4-special",
              "rect": [
                460,
                956,
                196,
                215
              ],
              "ms": 165,
              "layout": {
                "ax": 81.5,
                "ay": 249,
                "unit": 215,
                "above": 1.158139534883721,
                "below": 0,
                "halfWidth": 0.5325581395348837
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g4-special",
              "rect": [
                690,
                956,
                167,
                232
              ],
              "ms": 160,
              "layout": {
                "ax": 93.5,
                "ay": 233,
                "unit": 218,
                "above": 1.073394495412844,
                "below": 0,
                "halfWidth": 0.48394495412844035
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                956,
                169,
                226
              ],
              "ms": 160,
              "layout": {
                "ax": 97.5,
                "ay": 226,
                "unit": 218,
                "above": 1.073394495412844,
                "below": 0,
                "halfWidth": 0.48394495412844035
              }
            },
            {
              "image": "g4-special",
              "rect": [
                1150,
                956,
                173,
                231
              ],
              "ms": 160,
              "layout": {
                "ax": 105.5,
                "ay": 234,
                "unit": 218,
                "above": 1.073394495412844,
                "below": 0,
                "halfWidth": 0.48394495412844035
              }
            },
            {
              "image": "g4-special",
              "rect": [
                920,
                956,
                169,
                226
              ],
              "ms": 160,
              "layout": {
                "ax": 97.5,
                "ay": 226,
                "unit": 218,
                "above": 1.073394495412844,
                "below": 0,
                "halfWidth": 0.48394495412844035
              }
            }
          ]
        }
      }
    },
    "char_20": {
      "id": 20,
      "name": "بلّور",
      "original": "originals/char_20.png",
      "originalFilename": "20_Ballour_بلّور.png",
      "motions": {
        "walk": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                984,
                128,
                246
              ],
              "ms": 142,
              "layout": {
                "ax": 64.5,
                "ay": 241,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                984,
                127,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 240,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                984,
                127,
                245
              ],
              "ms": 142,
              "layout": {
                "ax": 63.5,
                "ay": 241,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                984,
                127,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 240,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            }
          ]
        },
        "run": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                992,
                173,
                230
              ],
              "ms": 105,
              "layout": {
                "ax": 84.5,
                "ay": 229,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                992,
                176,
                231
              ],
              "ms": 105,
              "layout": {
                "ax": 84.5,
                "ay": 231,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            }
          ]
        },
        "jump": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                241,
                903,
                217,
                241
              ],
              "ms": 180,
              "layout": {
                "ax": 103.5,
                "ay": 235,
                "unit": 264,
                "above": 1.1098484848484849,
                "below": 0.026515151515151516,
                "halfWidth": 0.42992424242424243
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                482,
                903,
                183,
                278
              ],
              "ms": 100,
              "layout": {
                "ax": 89.5,
                "ay": 275,
                "unit": 264,
                "above": 1.1098484848484849,
                "below": 0.026515151515151516,
                "halfWidth": 0.42992424242424243
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                723,
                903,
                208,
                259
              ],
              "ms": 215,
              "layout": {
                "ax": 107,
                "ay": 293,
                "unit": 264,
                "above": 1.1098484848484849,
                "below": 0.026515151515151516,
                "halfWidth": 0.42992424242424243
              }
            },
            {
              "image": "third-a-jump",
              "rect": [
                964,
                903,
                213,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 108.5,
                "ay": 228,
                "unit": 264,
                "above": 1.1098484848484849,
                "below": 0.026515151515151516,
                "halfWidth": 0.42992424242424243
              }
            }
          ]
        },
        "idle": {
          "loop": false,
          "hold": true,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                908,
                134,
                227
              ],
              "ms": 1000,
              "layout": {
                "ax": 77,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.3615023474178404
              }
            }
          ]
        },
        "win": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                908,
                134,
                227
              ],
              "ms": 95,
              "layout": {
                "ax": 77,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.38028169014084506
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                1060,
                908,
                155,
                227
              ],
              "ms": 1050,
              "layout": {
                "ax": 81,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.38028169014084506
              }
            }
          ]
        },
        "sad": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                908,
                134,
                227
              ],
              "ms": 120,
              "layout": {
                "ax": 59,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.4788732394366197
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                0,
                1135,
                131,
                223
              ],
              "ms": 1100,
              "layout": {
                "ax": 29,
                "ay": 215,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.4788732394366197
              }
            }
          ]
        },
        "wave": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                908,
                134,
                227
              ],
              "ms": 120,
              "layout": {
                "ax": 59,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.4788732394366197
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                212,
                1135,
                153,
                227
              ],
              "ms": 1100,
              "layout": {
                "ax": 51,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.4788732394366197
              }
            }
          ]
        },
        "clap": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                908,
                134,
                227
              ],
              "ms": 160,
              "layout": {
                "ax": 77,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.3615023474178404
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                424,
                1135,
                150,
                227
              ],
              "ms": 135,
              "layout": {
                "ax": 74,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.3615023474178404
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                636,
                1135,
                121,
                227
              ],
              "ms": 100,
              "layout": {
                "ax": 65,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.3615023474178404
              }
            },
            {
              "image": "third-a-reactions",
              "rect": [
                848,
                1135,
                143,
                227
              ],
              "ms": 145,
              "layout": {
                "ax": 67,
                "ay": 219,
                "unit": 213,
                "above": 1.028169014084507,
                "below": 0.03755868544600939,
                "halfWidth": 0.3615023474178404
              }
            }
          ]
        },
        "walkForward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                0,
                984,
                128,
                246
              ],
              "ms": 142,
              "layout": {
                "ax": 64.5,
                "ay": 241,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                984,
                127,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 240,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                372,
                984,
                127,
                245
              ],
              "ms": 142,
              "layout": {
                "ax": 63.5,
                "ay": 241,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                186,
                984,
                127,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 63.5,
                "ay": 240,
                "unit": 232,
                "above": 1.0387931034482758,
                "below": 0.021551724137931036,
                "halfWidth": 0.27801724137931033
              }
            }
          ]
        },
        "walkBackward": {
          "loop": true,
          "frames": [
            {
              "image": "g3-direction",
              "rect": [
                558,
                984,
                131,
                244
              ],
              "ms": 142,
              "layout": {
                "ax": 66.5,
                "ay": 240,
                "unit": 231,
                "above": 1.0432900432900434,
                "below": 0.017316017316017316,
                "halfWidth": 0.2878787878787879
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                984,
                129,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 64.5,
                "ay": 240,
                "unit": 231,
                "above": 1.0432900432900434,
                "below": 0.017316017316017316,
                "halfWidth": 0.2878787878787879
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                930,
                984,
                127,
                245
              ],
              "ms": 142,
              "layout": {
                "ax": 62.5,
                "ay": 241,
                "unit": 231,
                "above": 1.0432900432900434,
                "below": 0.017316017316017316,
                "halfWidth": 0.2878787878787879
              }
            },
            {
              "image": "g3-direction",
              "rect": [
                744,
                984,
                129,
                244
              ],
              "ms": 116,
              "layout": {
                "ax": 64.5,
                "ay": 240,
                "unit": 231,
                "above": 1.0432900432900434,
                "below": 0.017316017316017316,
                "halfWidth": 0.2878787878787879
              }
            }
          ]
        },
        "walkRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                992,
                173,
                234
              ],
              "ms": 145,
              "layout": {
                "ax": 86.5,
                "ay": 232,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                992,
                143,
                236
              ],
              "ms": 135,
              "layout": {
                "ax": 69.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                992,
                173,
                234
              ],
              "ms": 145,
              "layout": {
                "ax": 89.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                992,
                143,
                236
              ],
              "ms": 135,
              "layout": {
                "ax": 69.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            }
          ]
        },
        "walkLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                585,
                992,
                173,
                234
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 86.5,
                "ay": 232,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                992,
                143,
                236
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 69.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                975,
                992,
                173,
                234
              ],
              "ms": 145,
              "flip": true,
              "layout": {
                "ax": 89.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                780,
                992,
                143,
                236
              ],
              "ms": 135,
              "flip": true,
              "layout": {
                "ax": 69.5,
                "ay": 233,
                "unit": 222,
                "above": 1.0495495495495495,
                "below": 0.013513513513513514,
                "halfWidth": 0.40315315315315314
              }
            }
          ]
        },
        "runRight": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                992,
                173,
                230
              ],
              "ms": 105,
              "layout": {
                "ax": 84.5,
                "ay": 229,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                992,
                176,
                231
              ],
              "ms": 105,
              "layout": {
                "ax": 84.5,
                "ay": 231,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            }
          ]
        },
        "runLeft": {
          "loop": true,
          "frames": [
            {
              "image": "third-a-travel",
              "rect": [
                0,
                992,
                173,
                230
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 84.5,
                "ay": 229,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                390,
                992,
                176,
                231
              ],
              "ms": 105,
              "flip": true,
              "layout": {
                "ax": 84.5,
                "ay": 231,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            },
            {
              "image": "third-a-travel",
              "rect": [
                195,
                992,
                170,
                204
              ],
              "ms": 85,
              "flip": true,
              "layout": {
                "ax": 85.5,
                "ay": 236,
                "unit": 217,
                "above": 1.087557603686636,
                "below": 0.004608294930875576,
                "halfWidth": 0.4216589861751152
              }
            }
          ]
        },
        "land": {
          "loop": false,
          "frames": [
            {
              "image": "third-a-jump",
              "rect": [
                964,
                903,
                213,
                235
              ],
              "ms": 230,
              "layout": {
                "ax": 108.5,
                "ay": 228,
                "unit": 221,
                "above": 1.0316742081447965,
                "below": 0.03167420814479638,
                "halfWidth": 0.49095022624434387
              }
            }
          ]
        },
        "fly": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                0,
                972,
                197,
                227
              ],
              "ms": 165,
              "layout": {
                "ax": 82.5,
                "ay": 242,
                "unit": 213,
                "above": 1.1737089201877935,
                "below": 0,
                "halfWidth": 0.6784037558685446
              }
            },
            {
              "image": "g3-special",
              "rect": [
                235,
                972,
                214,
                222
              ],
              "ms": 165,
              "layout": {
                "ax": 73.5,
                "ay": 246,
                "unit": 213,
                "above": 1.1737089201877935,
                "below": 0,
                "halfWidth": 0.6784037558685446
              }
            },
            {
              "image": "g3-special",
              "rect": [
                470,
                972,
                208,
                211
              ],
              "ms": 165,
              "layout": {
                "ax": 63.5,
                "ay": 250,
                "unit": 213,
                "above": 1.1737089201877935,
                "below": 0,
                "halfWidth": 0.6784037558685446
              }
            }
          ]
        },
        "climb": {
          "loop": true,
          "frames": [
            {
              "image": "g3-special",
              "rect": [
                705,
                972,
                144,
                236
              ],
              "ms": 160,
              "layout": {
                "ax": 66.5,
                "ay": 233,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.013392857142857142,
                "halfWidth": 0.359375
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                972,
                150,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 71.5,
                "ay": 234,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.013392857142857142,
                "halfWidth": 0.359375
              }
            },
            {
              "image": "g3-special",
              "rect": [
                1175,
                972,
                148,
                238
              ],
              "ms": 160,
              "layout": {
                "ax": 67.5,
                "ay": 236,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.013392857142857142,
                "halfWidth": 0.359375
              }
            },
            {
              "image": "g3-special",
              "rect": [
                940,
                972,
                150,
                235
              ],
              "ms": 160,
              "layout": {
                "ax": 71.5,
                "ay": 234,
                "unit": 224,
                "above": 1.0535714285714286,
                "below": 0.013392857142857142,
                "halfWidth": 0.359375
              }
            }
          ]
        }
      }
    }
  }
};
