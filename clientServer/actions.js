const cardUser = require('./database/models/cardUser');

function saveCardUser(userData, io) {
    console.log('NFC - saveCardUser();');
    let data = new cardUser();

    const {
        id,
        name,
        country,
        company,
        title,
        email,
        companyNumber,
        companyAddress,
        companyLogo,
        companyColor1,
        companyColor2,
        companyColor3
    } = userData;

    if (
        !id ||
        !name ||
        !country ||
        !company ||
        !title ||
        !email ||
        !companyNumber ||
        !companyAddress ||
        !companyLogo ||
        !companyColor1 ||
        !companyColor2 ||
        !companyColor3
    ) {
        console.log('NFC - saveCardUser - Error');
    } else {
    }

    data.id = id;
    data.name = name;
    data.country = country;
    data.company = company;
    data.title = title;
    data.email = email;
    data.companyNumber = companyNumber;
    data.companyAddress = companyAddress;
    data.companyLogo = companyLogo;
    data.companyColor1 = companyColor1;
    data.companyColor2 = companyColor2;
    data.companyColor3 = companyColor3;

    data.save(err => {
        if (err) {
            console.log('NFC - saveCardUser - Saving Error: ', err);
            io.sockets.emit('Client_save_error');
        } else {
            console.log('NFC - saveCardUser - Saving Success');
            io.sockets.emit('Client_save_success');
        }
    });
}

function hueFindDevices(huejay) {
    console.log('HUE - Finding devices');
    huejay
        .discover()
        .then(bridges => {
            console.log('HUE - Devices Found');
            for (let bridge of bridges) {
                console.log('HUE - Bridge:', bridge.ip);
            }
        })
        .catch(error => {
            console.log(`An error occurred: ${error.message}`);
        });
}

function hueCreateUser(client) {
    let user = new client.users.User();

    user.deviceType = 'nicolaysNodeController';

    client.users
        .create(user)
        .then(user => {
            console.log(`HUE - New user created - Username: ${user.username}`);
        })
        .catch(error => {
            // if (error instanceof huejay.Error && error.type === 101) {
            //     return console.log(`Link button not pressed. Try again...`);
            // }

            console.log(error.stack);
        });
    return client;
}

function hueTestConnection(client) {
    client.bridge
        .ping()
        .then(() => {
            console.log('HUE - Successful connection');
            client.bridge
                .isAuthenticated()
                .then(() => {
                    console.log('HUE - Successful authentication');
                })
                .catch(error => {
                    console.log('HUE - Could not authenticate');
                    hueCreateUser(client);
                });
        })
        .catch(error => {
            console.log('HUE - Could not connect');
        });
}

function hueGetLightInfo(client) {
    client.lights.getAll().then(lights => {
        for (let light of lights) {
            console.log(`HUE - Light [${light.id}]: ${light.name}`);
            console.log(`      Type:             ${light.type}`);
            console.log(`      Unique ID:        ${light.uniqueId}`);
            console.log(`      Manufacturer:     ${light.manufacturer}`);
            console.log(`      Model Id:         ${light.modelId}`);
            console.log('HUE - Model:');
            console.log(`      Id:             ${light.model.id}`);
            console.log(`      Manufacturer:   ${light.model.manufacturer}`);
            console.log(`      Name:           ${light.model.name}`);
            console.log(`      Type:           ${light.model.type}`);
            console.log(`      Color Gamut:    ${light.model.colorGamut}`);
            console.log(`      Friends of Hue: ${light.model.friendsOfHue}`);
            console.log(`      Software Version: ${light.softwareVersion}`);
            console.log('HUE - State:');
            console.log(`      On:         ${light.on}`);
            console.log(`      Reachable:  ${light.reachable}`);
            console.log(`      Brightness: ${light.brightness}`);
            console.log(`      Color mode: ${light.colorMode}`);
            console.log(`      Hue:        ${light.hue}`);
            console.log(`      Saturation: ${light.saturation}`);
            console.log(`      X/Y:        ${light.xy[0]}, ${light.xy[1]}`);
            console.log(`      Color Temp: ${light.colorTemp}`);
            console.log(`      Alert:      ${light.alert}`);
            console.log(`      Effect:     ${light.effect}`);
            console.log();
        }
    });
}

function hueChangeLightColor(client, lightId, tempColor) {
    client.lights
        .getById(lightId)
        .then(light => {
            light.brightness = 254;
            light.hue = tempColor;
            light.saturation = 254;

            return client.lights.save(light);
        })
        .then(light => {
            console.log(`HUE - Updated light [${light.id}]`, tempColor);
        })
        .catch(error => {
            console.log('Something went wrong');
            console.log(error.stack);
        });
}

module.exports = {
    saveCardUser,
    hueFindDevices,
    hueCreateUser,
    hueTestConnection,
    hueGetLightInfo,
    hueChangeLightColor
};
