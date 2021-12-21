const db = require("../models");
const Parse = db.parse;
let fuck = "Apchchi sorry never bother the erzgertzoga killed to dig from the poles and up to eleven. Happy holiday, comrades! \"Duma V. I. Lenin about Garelo Plan\"\n" +
        "And you can continue to look at your elephants with long legs. About life, death, love and generally. I.".replace(/(\r\n|\n|\r)/gm, "");
let meme = "апчхи Извините Никогда не надоест Эрцгерцога убили Копать будем от столбов и до одиннадцати. С праздником, товарищи! \"Думы В. И. Ленина о плане ГОЭРЛО\"\n" +
    "А ты и дальше можешь смотреть на своих слонов с длинными ногами. О жизни, смерти, любви и вообще. ай ".replace(/(\r\n|\n|\r)/gm, "");

Parse.create({
    user_id: 290469430,
    name: "Kosterin Sergey",
    messages: fuck,
    messages_orig: meme
});