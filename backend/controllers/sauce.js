const Sauce = require('../models/sauce')
const fs = require('fs')
const sauce = require('../models/sauce')

exports.getSauces = (req, res, next) => {
    Sauce.find().then(sauces => {
        res.status(200).json(sauces)
    }).catch(
        (error) => {
            res.status(400).json({
                error: error
            })
        }
    )
}

exports.getSauceById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then(sauce => {
        res.status(200).json(sauce)
    }).catch(
        (error) => {
            res.status(400).json({
                error: error
            })
        }
    )
}

exports.addSauce = (req, res, next) => {
    const body = JSON.parse(req.body.sauce)
    if (!body.name ||
        !body.manufacturer ||
        !body.description ||
        !body.mainPepper ||
        !body.heat ||
        !body.userId
    ) {
        res.status(401).json({ "message": "Invalid information." })
        return
    }
    const sauce = new Sauce({
        "userId": body.userId,
        "name": body.name,
        "manufacturer": body.manufacturer,
        "description": body.description,
        "mainPepper": body.mainPepper,
        "imageUrl": `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        "heat": body.heat,
        "likes": 0,
        "dislikes": 0,
        "usersLiked": [],
        "usersDisliked": [],
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce added.' }))
        .catch(error => res.status(401).json(error))
}

exports.updateSauceById = (req, res, next) => {
    let newSauce = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
        : req.body
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
                return
            }
            Sauce.updateOne({ _id: req.params.id }, newSauce)
                .then(() => {
                    if (req.file) {
                        const filename = sauce.imageUrl.split('/images/')[1]
                        fs.unlink(`images/${filename}`, () => { })
                    }
                    res.status(200).json({ message: 'Updated Sauce.' })
                })
                .catch(error => res.status(401).json({ error }))
        })
        .catch(error => { res.status(500).json({ error }) })
}

exports.deleteSauceById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce removed.' }) })
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => {
            res.status(500).json({ error })
        })
}

exports.likeSauceById = (req, res, next) => {
    let sauce = Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            let likeIndex = sauce.usersLiked.indexOf(req.body.userId)
            let dislikeIndex = sauce.usersDisliked.indexOf(req.body.userId)
            switch (req.body.like) {
                case 0: // remove the like or dislike
                    if (likeIndex != -1) {
                        sauce.usersLiked.splice(likeIndex, 1)
                    }
                    if (dislikeIndex != -1) {
                        sauce.usersDisliked.splice(dislikeIndex, 1)
                    }
                    break
                case 1: // like
                    if (likeIndex == -1) {
                        sauce.usersLiked.push(req.body.userId)
                    }
                    if (dislikeIndex != -1) {
                        sauce.usersDisliked.splice(dislikeIndex, 1)
                    }
                    break
                case -1: // dislike
                    if (likeIndex != -1) {
                        sauce.usersLiked.splice(likeIndex, 1)
                    }
                    if (dislikeIndex == -1) {
                        sauce.usersLiked.push(req.body.userId)
                    }
                    break
            }
            Sauce.updateOne({ _id: sauce.id }, sauce)
                .then(() => { res.status(200).json({ message: 'Updated sauce.' }) })
                .catch(error => res.status(401).json({ error }))
        })
        .catch(error => { res.status(500).json({ error }) })
}
