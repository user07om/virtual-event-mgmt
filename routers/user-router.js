const { LoginUser, RegisterUser } = require("./../controllers/user-controller.js")
const router = require("express").Router()

router.use("/login", LoginUser)
router.use("/register", RegisterUser)

module.exports = router
