const router = require("express").Router();
const paymentRouter = require("./payments.routes");

const service = require("../services/plans.services");

router.get("/", service.findAll);
router.post("/", service.create);

//check user access
router.use("/", service.checkAccess);

router.get("/:id", service.findById);
router.put("/:id", service.updateById); 
router.delete("/:id", service.deleteById);

router.post("/:id/add-member", service.addMember);
router.post("/:planId/payments", paymentRouter);

module.exports = router;
