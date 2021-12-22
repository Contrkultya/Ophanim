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
        owner_id: req.body.vk_id
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
            await Parse.create({
                user_id: req.body.vk_id,
                name: user[0].first_name + " " + user[0].last_name,
                messages: messages,
                messages_orig: messagesOrig
            }).then((meme) => {
                res.setHeader('Content-Type', 'application/json');
                return res.status(201).send({parse_id: meme.id});
            }).catch(err => {
                res.status(500).send({ message: err.message });
            });
        });
    });
};

exports.analyze = async (req, res) => {
    let analId = null;
    Parse.findOne({
        where: {
            id: req.body.parse_id
        }
    }).then(anal => {
        Analysis.create({
            parse_id: req.body.parse_id,
            user_id: anal.user_id,
            status: 'Pending',
            result: ''
        }).then((val) => {
            analId = val.id;
            workNigga();
            return res.status(200).send({msg: 'In progress', analId});
        });
    });


    function workNigga() {
        const parseId = req.body.parse_id;
        const parsing = Parse.findOne({where: {id: parseId}}).then((prs) => {
            let tokenResponse;
            try {
                tokenResponse = JSON.parse(this.responseText);
            } catch (ex) {
                // TODO: handle parsing exception
            }
            const payload = `{"Inputs":{"input1":[{"id":0,"text":"${prs.messages}","class":"null"}]}}`;
            const scoring_url = config.constants.AZURE_URL;
            // ibm hours r dead, so now we'll do that lmao
            req = new XMLHttpRequest();
            req.open('post', scoring_url);
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader('authorization', `Bearer ${config.azureToken}`);
            req.onreadystatechange = function () {
                if (req.readyState == 4 && req.status == 200) {
                    let parsedPostResponse;
                    try {
                        parsedPostResponse = JSON.parse(this.responseText);

                        Analysis.update({
                            status: 'done',
                            result: this.responseText,
                        }, {
                            where: {
                                id: analId
                            }
                        });
                    } catch (ex) {
                        console.log(ex);
                        // TODO: handle parsing exception
                    }
                }
                else console.log(req.status)
            };
            req.send(payload);
        });
    }
};

exports.parsingsById = (req, res) => {
    const userId = req.query.user_id;
    Analysis.findAll({
        where: {
            user_id: userId
        },
        raw: true
    }).then(result => {
        return res.status(200).send(result);
    });
};

exports.resultsById = (req, res) => {
    const userId = req.query.user_id;
    Parse.findAll({
        where: {
            user_id: userId
        },
        raw: true
    }).then((result) => {
        return res.status(200).send(result);
    });
};

exports.getStatus = (req, res) => {
    const analId = req.params.id;
    Analysis.findOne({
        where: {
            id: analId
        },
        raw: true
    }).then((result) => {
        return res.status(200).send(result);
    })
};

exports.allResults = (req, res) => {
    Analysis.findAll({
        raw: true
    }).then((result) => {
        return res.status(200).send(result);
    });
};

