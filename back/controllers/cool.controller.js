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
        });
        messagesOrig = messages;
        translatte(messages, {to: 'en'}).then(async (result) => {
            messages = result.text;
            const user = await vk.api.users.get({
                user_ids: req.body.vk_id
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
        });
    });
};

exports.analyze = async (req, res) => {
    let analId = null;
    Parse.findOne({
        where: {
            id: req.query.parseId
        }
    }).then(user => {
        Analysis.create({
            parse_id: req.query.parseId,
            user_id: user.id,
            status: 'Pending',
            result: ''
        }).then((val) => {
            analId = val.id;
        });
    });

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

    function getFinal(response, tokenResponse) {
        const cats = [
            "Category_attempted to attempt",
            "Category_disease/mental disorders/affective disorder",
            "Category_disease/mental disorders/self-destructive behavior/suicide",
            "Category_disease/nervous system diseases/bad",
            "Category_disease/nervous system diseases/pain",
            "Category_movies/film genres/anime/animal/invertebrates",
            "Category_people",
            "Category_psychology/behavior and behavior mechanisms/emotions",
            "Category_psychology/behavior and behavior mechanisms/emotions/love",
            "Category_psychology/psychological phenomena and processes/mental processes/learning/better"
        ];
        let fields = '';
        let values = '';
        cats.forEach((el) => {
            fields += `"${el}" ,`;
            values += `"${response.predictions[0].values[0][response.predictions[0].fields.indexOf(el)]}" ,`;
        });
        const newPayload = `{"input_data": [{"fields": [${fields.slice(0, -1)}], "values": [[ ${values.slice(0, -1)}]]}]}`;
        const newScoring_url = "https://eu-gb.ml.cloud.ibm.com/ml/v4/deployments/suicide_2/predictions?version=2021-12-20";
        return getToken((err) => console.log(err), function () {
            let tokenResponse;
            try {
                tokenResponse = JSON.parse(this.responseText);
            } catch (ex) {
                // TODO: handle parsing exception
            }
            apiPost(newScoring_url, tokenResponse.access_token, newPayload, function (resp) {
                let parsedPostResponse;
                try {
                    Analysis.update({
                        status: 'done',
                        result: this.responseText
                    }, {
                        where: {
                            id: analId
                        }
                    });
                } catch (ex) {
                    // TODO: handle parsing exception
                }
            }, function (error) {
                console.log(error);
            });
        });
    }

    const parseId = req.query.parseId;
    const parsing = Parse.findOne({where: {id: parseId}}).then((prs) => {
        getToken((err) => console.log(err), function () {
            let tokenResponse;
            try {
                tokenResponse = JSON.parse(this.responseText);
            } catch (ex) {
                // TODO: handle parsing exception
            }
            const payload = `{"input_data": [{"fields": ["id", "text", "class"], "values": [[ null, "${prs.messages}", null]]}]}`;
            const scoring_url = "https://eu-gb.ml.cloud.ibm.com/ml/v4/deployments/suicide/predictions?version=2021-12-20";
            apiPost(scoring_url, tokenResponse.access_token, payload, function (resp) {
                let parsedPostResponse;
                try {
                    parsedPostResponse = JSON.parse(this.responseText);
                    let meme = getFinal(parsedPostResponse, tokenResponse);
                    console.log('sas');
                } catch (ex) {
                    // TODO: handle parsing exception
                }
            }, function (error) {
                console.log(error);
            });
        });

    });
    return res.status(200).send({msg: 'In progress'});
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
