@echo off
"C:\\Program Files\\Java\\jdk-17\\bin\\java" ^
  --class-path ^
  "C:\\Users\\ritvi\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  26 ^
  --output ^
  "C:\\Users\\ritvi\\AppData\\Local\\Temp\\agp-prefab-staging3814788494537616354\\staged-cli-output" ^
  "C:\\Users\\ritvi\\.gradle\\caches\\8.14.2\\transforms\\fb15361400df7dca3771f40242de4076\\transformed\\react-android-0.76.9-release\\prefab" ^
  "C:\\New folder\\Aerosystem Booking\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-reanimated\\6y5j615e" ^
  "C:\\Users\\ritvi\\.gradle\\caches\\8.14.2\\transforms\\c08e072f8e515d72808790618d6e0266\\transformed\\hermes-android-0.76.9-release\\prefab" ^
  "C:\\Users\\ritvi\\.gradle\\caches\\8.14.2\\transforms\\284f302da7aa3a9dd3553e98866f7270\\transformed\\fbjni-0.6.0\\prefab"
