if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/ritvi/.gradle/caches/8.10.2/transforms/9edd09640466d6c66923240b27c5f18a/transformed/hermes-android-0.76.9-debug/prefab/modules/libhermes/libs/android.armeabi-v7a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/ritvi/.gradle/caches/8.10.2/transforms/9edd09640466d6c66923240b27c5f18a/transformed/hermes-android-0.76.9-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

