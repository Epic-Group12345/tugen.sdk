import std/unittest
import ../src/tugen_sdk

suite "sdk":
  test "версия":
    check SdkVersion.major == 0
