// Import firebase-function lib
const functions = require('firebase-functions');
// Import firebase-admin lib
const admin = require('firebase-admin');
// Import geo distance
var Distance = require('geo-distance');

/** Tempory for Test */
// import json object from json file
const shopList = require('./shopList.json');
const itemList = require('./itemList.json');

// initialize
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://virtual-market-23983.firebaseio.com"
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

function updateUserLocation(userId,latitude,longitude) {
    admin.database().ref('/users/' + userId + '/location').update({
        Latitude: latitude,
        Longitude: longitude
    });
}

// http request : write user location
exports.writeUserLocation = functions.https.onRequest(async (request, response) => {
    // get UserID
    const userId = request.query.userId;
    // get new Lagitude, Longitude
    const latitude = parseFloat(request.query.latitude);
    const longitude = parseFloat(request.query.longitude);
    // write user location on database
    updateUserLocation(userId,latitude,longitude);

});


// database trigger : on user location
exports.updateNearShopAndItem = functions.database.ref('/users/{userId}/location')
    .onWrite((change,eventContext) => {
        const location = change.after.val();
        const userid = eventContext.params.userId;

        // update near shop
        var userLocation = {
            lat: location.Latitude,
            lon: location.Longitude
        }
        
        var nearshoplist = new Array();
        var t_nearitemlist = new Array();

        // find shop and item near user location
        admin.database().ref('/users').once('value')
        .then(users => {
            // get data success
            users.forEach(userId => {
                if(userid !== userId.key)
                {
                    // each userId
                    if(userId.child("shopinfo").exists())
                    {
                        // get shopinfo val
                        var shopRef =  userId.child("shopinfo");
                        var shopInfo = shopRef.val();
                        var shopLocation = {
                            lat: shopInfo.FixedLatitude,
                            lon: shopInfo.FixedLongitude
                        }
                        // find shop distance
                        var shopDistance = Distance.between(userLocation,shopLocation);
                        if(shopDistance <= Distance('100 m'))
                        {
                            addshop =   {
                                description: shopInfo.description,
                                latitude: shopInfo.FixedLatitude,
                                longitude: shopInfo.FixedLongitude,
                                name: shopInfo.Name,
                                phone: shopInfo.PhoneNumber
                            }
                            nearshoplist.push(addshop);
                            
                            // add near by item
                            if(shopRef.child("itemlist").exists())
                            {
                                var shopitemRef = shopRef.child("itemlist");
                                shopitemRef.forEach(item => {
                                    var itemInfo = item.val();
                                    addItem = {
                                        description: itemInfo.Description,
                                        picURL: itemInfo.PicURL,
                                        price: itemInfo.Price,
                                        shopname: shopInfo.Name 
                                    }
                                    t_nearitemlist.push(addItem);
                                });
                            }
                        }
                    }       
                }
                
            });
            // write to firebase
            // near shop 
            const nearshopref = admin.database().ref('/users/' + userid + '/nearbyshop');
            nearshopref.update({
                shopinfo: nearshoplist,
                totalshop: nearshoplist.length
            });
            // near item
            const nearItemRef = admin.database().ref('/users/' + userid + '/nearbyitem');
            nearItemRef.update({
                iteminfo: getnearbyitem(t_nearitemlist),
                totalitem: t_nearitemlist.length
            });
            return console.log("Finish");   
        })
        .catch(error => {
            console.log(error);
        });
    });

function getnearbyitem(t_nearitemlist) {
    var nearitemlist = [];
    var numItem = t_nearitemlist.length;
    console.log("numItem " + numItem);
    var numPage = parseInt(numItem/10);
    var remainItem = numItem % 10;
    var iPage;
    var iItem;
    var eachItem = 0;
    for(iPage = 0;iPage <= numPage;iPage++){
        var itemlist = [];
        if(iPage !== numPage){
            for(iItem = 0;iItem < 10;iItem++){
                itemlist.push(t_nearitemlist[eachItem])
                eachItem += 1;
            }
            nearitemlist.push(itemlist);
        }
        else
        {
            for(iItem = 0;iItem < remainItem;iItem++) {
                itemlist.push(t_nearitemlist[eachItem])
                eachItem += 1;
            }
            nearitemlist.push(itemlist);
        }
        
    }
    return nearitemlist;
}
    