const { ObjectId } = require("mongodb");
const Joi = require("joi");

const db = require("../mongo");

const paymentObj = Joi.object({
  title: Joi.string().required(),
  note: Joi.string().allow('').optional(),
  paidBy: Joi.array().items(
    Joi.object({    
      memberId: Joi.string().hex().required(),    //payerId (memberId)
      amount: Joi.number().required(),    //amount paid by that member
    })
  ).min(1).required(),
  splitAmong: Joi.array().items(
    Joi.string().hex().required()   //memberId
  ).min(1).optional(),
  settlement: Joi.bool().optional()
});

const service = {
  async findAll(req, res) {
    //get all the payments for current plan
    try {
      let planId = req.params.id;
      var data = await db.payments.find({ planId }).toArray();
      res.send(data);
    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async findById(req, res) {
    try {
      let planId = req.params.id;
      let paymentId = req.params.paymentId;

      //get plan
      const payment = await db.payments.findOne({ _id: new ObjectId(paymentId), planId });

      //if payment is not found
      if (!payment) {
        return res.send({ error: { message: "Not found" } });
      }
      res.send({ ...payment });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async create(req, res) {
    try {
      //Validate Request Body
      const { error } = await paymentObj.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message } });
      
      let planId = req.params.id;
      req.body.planId = planId;
      await db.payments.insertOne({...req.body});
      res.send({ success: { message: "Payment added successfully" } });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async updateById(req, res) {
    try {
      //Validate Request Body
      const { error } = await paymentObj.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message } });
      
      let planId = req.params.id;
      let paymentId = req.params.paymentId;
      const payment = await db.payments.findOne({ _id: new ObjectId(paymentId), planId });
      //check if payment exists
      if(!payment) {
        return res.send({ error: { message: "Invalid" } });
      }

      req.body.planId = planId;
      await db.payments.updateOne(
        { _id: new ObjectId(paymentId), planId },
        { $set: { ...req.body } }
      );
      res.send({ success: { message: "Payment updated successfully" } });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async deleteById(req, res) {
    try {
      let planId = req.params.id;
      let paymentId = req.params.paymentId;
      const payment = await db.payments.findOne({ _id: new ObjectId(paymentId), planId });
      //check if payment exists
      if(!payment) {
        return res.send({ error: { message: "Invalid" } });
      }

      //delete the payments
      await db.payments.deleteOne({ _id: new ObjectId(paymentId), planId });
      res.send({ success: { message: "Payment deleted successfully" } });
    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  }

};

module.exports = service;
