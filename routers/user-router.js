const { LoginUser, RegisterUser } = require("./../controllers/user-controller.js")
const router = require("express").Router()

router.post("/login", LoginUser)
router.post("/register", RegisterUser)

module.exports = router
