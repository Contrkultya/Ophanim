const db = require("../models");
const Parse = db.parse;
const Analysis = db.analysis;
const VKontach = require('vk-io');
const translatte = require('translatte');
const config = require('../config/config');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const vk = new VKontach.VK({
    token: config.vkToken
});

exports.parse = async (req, res) => {
    let messages = "";
    let messagesOrig = "";
    const response = await vk.api.wall.get({
        owner_id: req.query.vk_id
    }).then((result) => {
        result.items.forEach((item) => {
            if (item.text) {
                messages += item.text + ' ';
            }
        })
    });
    const user = await vk.api.users.get({
        user_ids: req.body.vk_id
    });
    translatte(messages, {to: 'en'}).then((res) => {
        messages = res;
        messagesOrig = res;
    });
    const parsing = await Parse.create({
        user_id: req.body.vk_id,
        name: user[0].first_name + " " + user[0].last_name,
        messages: messages,
        messages_orig: messagesOrig
    }).then((meme) => {
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).send({parse_id: meme.id});
    })
};

exports.analyze = async (req, res) => {
    function getToken(errorCallback, loadCallback) {
        const req = new XMLHttpRequest();
        req.addEventListener("load", loadCallback);
        req.addEventListener("error", errorCallback);
        req.open("POST", "https://iam.cloud.ibm.com/identity/token");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.setRequestHeader("Accept", "application/json");
        req.send("grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + config.ibmToken);
    }

    function apiPost(scoring_url, token, payload, loadCallback, errorCallback) {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener("load", loadCallback);
        oReq.addEventListener("error", errorCallback);
        oReq.open("POST", scoring_url);
        oReq.setRequestHeader("Accept", "application/json");
        oReq.setRequestHeader("Authorization", "Bearer " + token);
        oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        oReq.send(payload);
    }

    const parseId = req.query.parseId;
    const parsing = Parse.findOne({id: parseId}).then((prs) => {
        getToken((err) => console.log(err), function () {
            let tokenResponse;
            try {
                tokenResponse = JSON.parse(this.responseText);
            } catch (ex) {
                // TODO: handle parsing exception
            }
            const payload = `{"input_data": [{"fields": ["id", "text", "class"], "values": [["${prs.messages}"], [null], [null]]}]}`;
            const scoring_url = "https://eu-gb.ml.cloud.ibm.com/ml/v4/deployments/suicide/predictions?version=2021-12-20";
            apiPost(scoring_url, tokenResponse.access_token, payload, function (resp) {
                let parsedPostResponse;
                try {
                    parsedPostResponse = JSON.parse(this.responseText);
                } catch (ex) {
                    // TODO: handle parsing exception
                }
                console.log("Scoring response");
                console.log(parsedPostResponse);
            }, function (error) {
                console.log(error);
            });
        });

    });
};

exports.parsingsById = (req, res) => {
    const userId = req.body.user_id;
    const parsings = Analysis.findAll({
        where: {
            user_id: userId
        },
        raw: true
    });
    return res.status(200).send(parsings);
};

exports.getStatus = (req, res) => {
    const parseId = req.params.id;
    const parse = Analysis.findOne({
        where: {
            user_id: parseId
        },
        raw: true
    });
    return res.status(200).send(parse);
};
