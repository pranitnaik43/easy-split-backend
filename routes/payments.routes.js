const router = require("express").Router({mergeParams: true});

const service = require("../services/payments.services");

router.get("/", service.findAll);
router.get("/:id", service.findById);


module.exports = router;
