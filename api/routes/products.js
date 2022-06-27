const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/products');
const checkAuth = require('../middleware/check-auth')

router.get('/',(req, res, next) => {
    Product.find()
    .select('name price _id')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    reqeust: {
                        type: 'GET',
                        url: 'http://localhost:8000/products/'+doc._id
                    }
                }
            })
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,      //{ type: String, required: true }
        price: req.body.price  //{ type: Number, required: true }
    });
    product.save()
        .then(result => {
            res.status(201).json({
                message: 'created product succesfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    reqeust: {
                        type: 'GET',
                        url: 'http://localhost:8000/products/'+result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.get('/:productsId', (req, res ,next) => {
    const id = req.params.productsId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            if (doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8000/products'
                    }
                })
            } else {
                res.status(404).json({message: 'No valid entry found for provided ID'})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
})

router.patch('/:productsId', checkAuth, (req, res ,next) => {
    const id = req.params.productsId
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.findByIdAndUpdate({_id: id }, {$set :updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message:'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:8000/products/' + id
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:productsId', checkAuth, (req, res ,next) => {
    const id = req.params.productsId
    Product.remove({_id:id})
        .exec()
        .then(result => {
            res.status(200).json({
                message:'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:8000/products',
                    body: {name: 'String', price: 'Number'}
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;