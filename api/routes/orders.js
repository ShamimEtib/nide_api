const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/products');
const checkAuth = require('../middleware/check-auth')

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        product: doc.product,
                        quantity: doc.quantity,
                        _id: doc._id,
                        reqeust: {
                            type: 'GET',
                            url: 'http://localhost:8000/orders/'+doc._id
                        }
                    }
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if(product ){
                const order = new Order({
                    _id: mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.productId
                })
                order.save()
                .then(result => {
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            product: result.product,
                            quantity: result.quantity,
                            _id: result._id,
                            reqeust: {
                                type: 'GET',
                                url: 'http://localhost:8000/orders/'+result._id
                            }
                        }
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
            } else {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.get('/:orderId',checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('product quantity _id')
        .exec()
        .then(doc => {
            if (doc){
                res.status(200).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8000/orders'
                    }
                })
            } else {
                res.status(404).json({message: 'Order not found'})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
})

router.delete('/:orderId', checkAuth,(req, res, next) => {
    Order.remove({_id:req.params.orderId})
        .exec()
        .then(result => {
            res.status(200).json({
                message:'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:8000/orders',
                    body: {productId: 'ID', quantity: 'Number'}
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