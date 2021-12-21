const { ObjectId } = require("mongodb");
const Joi = require("joi");

const db = require("../mongo");

const planBody = Joi.object({
  name: Joi.string().required(),
  members: Joi.array().items().min(0).optional()
});

const memberObj = Joi.object({
  id: Joi.string().hex().required(),
  name: Joi.string().min(1).required()
})

const service = {
  async findAll(req, res) {
    //get all the plans for the user
    try {
      let userId = req.userId;
      var data = await db.plans.find({ owner: userId }).toArray();
      res.send(data);
    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async checkAccess(req, res, next) {
    let planId = req.params.id;
    //get plan
    const plan = await db.plans.findOne({ _id: new ObjectId(planId) });
    //if plan is not found
    if (!plan) {
      return res.send({ error: { message: "Plan not found" } });
    }
    //check if user has access
    console.log(plan.owner, req.userId);
    if(plan.owner!==req.userId) {
      return res.send({ error: { message: "User does not have access to this plan" } });
    }
    next();
  },
  async findById(req, res) {
    //get plan by id
    try {
      let planId = req.params.id;

      //get plan
      const plan = await db.plans.findOne({ _id: new ObjectId(planId) });

      //if plan is not found
      if (!plan) {
        return res.send({ error: { message: "Plan not found" } });
      }
      res.send({ ...plan });
    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async create(req, res) {
    try {
      //Validate Request Body
      const { error } = await planBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message } });
      
      //check if name already exists
      const data = await db.plans.findOne({ name: req.body.name, owner: req.userId });
      if (data) {
        return res.send({ error: { message: "Plan name already exists" } });
      }
      
      req.body.owner = req.userId;
      await db.plans.insertOne(req.body);
      res.send({ success: { message: "Plan created successfully" } });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async updateById(req, res) {
    try {
      //Validate Request Body
      const { error } = await planBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message } });
      
      let planId = req.params.id;
      const plan = await db.plans.findOne({ _id: new ObjectId(planId) });
      //check if plan exists
      if(!plan) {
        return res.send({ error: { message: "Plan does not exists" } });
      }

      //check if user has access
      if(plan.owner!==req.userId) {
        return res.send({ error: { message: "User does not have access to this plan" } });
      }

      await db.plans.updateOne(
        { _id: new ObjectId(planId) },
        { $set: { ...req.body } }
      );
      res.send({ success: { message: "Plan name changed successfully" } });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async addMember(req, res) {
    try {
      //Validate Request Body
      const { error } = await memberObj.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message } });
      
      let planId = req.params.id;
      //check if plan exists
      const plan = await db.plans.findOne({ _id: new ObjectId(planId) });
      if(!plan) {
        return res.send({ error: { message: "Plan does not exists" } });
      }

      //check if user has access
      if(plan.owner!==req.userId) {
        return res.send({ error: { message: "User does not have access to this plan" } });
      }

      if(!plan.members) plan.members=[];

      plan.members.push(req.body);

      await db.plans.updateOne(
        { _id: new ObjectId(planId) },
        { $set: { ...plan } }
      );
      res.send({ success: { message: "Plan name changed successfully" } });

    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  },
  async deleteById(req, res) {
    try {
      let planId = req.params.id;

      //check if plan exists
      const plan = await db.plans.findOne({ _id: new ObjectId(planId) });
      if (!plan) {
        return res.send({ error: { message: "Plan does not exist" } });
      }

      //check if user has access
      if(plan.owner!==req.userId) {
        return res.send({ error: { message: "User does not have access to this plan" } });
      }

      //delete the plan
      await db.plans.deleteOne({ _id: new ObjectId(planId) });
      res.send({ success: { message: "Plan deleted successfully" } });
    } catch (err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" } });
    }
  }

};

module.exports = service;
