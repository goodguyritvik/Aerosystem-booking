if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/ritvi/.gradle/caches/8.14.2/transforms/c08e072f8e515d72808790618d6e0266/transformed/hermes-android-0.76.9-release/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/ritvi/.gradle/caches/8.14.2/transforms/c08e072f8e515d72808790618d6e0266/transformed/hermes-android-0.76.9-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

