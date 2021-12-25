const router = require("express").Router({mergeParams: true});

const service = require("../services/payments.services");

router.get("/", service.findAll);
router.post("/", service.create);

router.get("/:paymentId", service.findById);
router.put("/:paymentId", service.updateById); 
router.delete("/:paymentId", service.deleteById);

module.exports = router;
