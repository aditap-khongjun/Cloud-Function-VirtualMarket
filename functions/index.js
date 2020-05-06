// Import firebase-function lib
const functions = require('firebase-functions');
// Import firebase-admin lib
const admin = require('firebase-admin');

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
exports.findNearShopAndItem = functions.database.ref('/users/{userId}/location')
    .onWrite((change,eventContext) => {
        console.log("change : ")
        console.log(change);
        console.log("context : ")
        console.log(eventContext);
        
        const location = change.after.val();
        const userId = eventContext.params.userId;

        const shop1 = {
            name: "วินปากซอยพฤกษา83",
            description: "วินมอเตอร์ไซด์",
            phone: "",
            latitude: 13.7886,
            longitude: 100.27997
        };
        const shop2 = {
            name: "ร้านดำ",
            description: "ร้านขายของชำ",
            phone: "09222480908",
            latitude: 13.789804,
            longitude: 100.276809,
            facebookurl: "http://www.facebook.com/thanawai.srisomp",
            lineid: "thanawai.dong",
            website: "http://communitiy.thunkable.com/t/thanawai-from"
        };

        const shop3 = {
            name: "ศิริพรเภสัช",
            description: "ร้านขายยา",
            phone: "0896641129",
            latitude: 13.788689,
            longitude: 100.279974,
            facebookurl: "http://www.facebook.com/rajavithipharmacy"
        };
        // update near shop
        const nearshopref = admin.database().ref('/users/' + userId + '/nearbyshop');
        nearshopref.set({
            shop: [shop1,shop2,shop3]
        });

        const item1 = {
            shopname: "วินปากซอยพฤกษา83",
            description: "ส่งคน",
            picURL: "http://readthecloud.co/pic1",
            price: "เริ่มต้น 10 บาท 2 กม. แรก",
        };
        const item2 = {
            shopname: "วินปากซอยพฤกษา83",
            description: "ส่งของ",
            picURL: "http://readthecloud.co/pic2",
            price: "เริ่มต้น 10 บาท 3 กม. แรก",
        };
        const item3 = {
            shopname: "ร้านดำ",
            description: "ถั่วดำ",
            picURL: "http://readthecloud.co/pic3",
            price: "30 บาท",
        };
        const item4 = {
            shopname: "ถั่วแดง",
            description: "ส่งคน",
            picURL: "http://readthecloud.co/pic4",
            price: "20 บาท",
        };
        const item5 = {
            shopname: "ศิริพรเภสัช",
            description: "ยาโดยเภสัชกร",
            picURL: "http://readthecloud.co/pic5",
            price: "3-500 บาท",
        };
        // update near item
        const nearItemRef = admin.database().ref('/users/' + userId + '/nearbyItem/itemList');
        nearItemRef.set({
            item: [item1,item2,item3,item4,item5]
        });
    });


    