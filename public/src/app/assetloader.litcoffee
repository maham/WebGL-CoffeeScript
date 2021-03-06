AssetLoader
===========
The AssetLoader can load a list of assets and call back on completion.

Dependencies
------------
AssetLoader will utilise MicroAjax to take care of async loading of resources.

    define [
        'app/microajax'
    ], (
        MicroAjax
    ) ->
        class AssetLoader

constructor
-----------
To start of the loading an AssetLoader is created with a list of keys and values containing the URLs and the names of
the assets to load. To store the loaded resources a member @assets is created and initialized. Keeping track on when all
assets are loaded is done by counting the URL/name pairs and then decrease this value for every completed asset load. A
call to @loadAsset is made for each URL.

            constructor: ( assetUrls, @callbackFunction ) ->
                @assets = []
                @numIncompleteAssets = assetUrls.length

                for currentAssetUrl, currentUrlIndex in assetUrls
                    @loadAsset currentAssetUrl, currentUrlIndex

loadAsset
---------
Loading of assets is done using MicroAjax. On completion the loaded resource and the name passed to loadAsset is sent to
onAssetLoaded.

            loadAsset: ( assetUrl, assetIndex ) ->
                new MicroAjax assetUrl, ( resource ) =>
                    @onAssetLoaded resource, assetIndex

onAssetLoaded
-------------
A finished asset is stored in @assets with the asset name as the key. The number of incomplete assets are decreased and
if this value reaches zero the callback function from the constructor is called.

            onAssetLoaded: ( resource, assetIndex ) ->
                @assets[assetIndex] = resource
                @numIncompleteAssets--

                @callbackFunction @assets if @numIncompleteAssets <= 0
