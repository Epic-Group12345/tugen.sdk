version       = "0.1.0"
author        = "Epic Group"
description   = "TUGEN SDK for game developers"
license       = "Proprietary"
srcDir        = "src"

requires "nim >= 2.2.0"

task test, "Тесты SDK":
  exec "nim r --hints:off tests/tsdk.nim"
