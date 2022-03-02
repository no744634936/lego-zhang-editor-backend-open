/*
json schema 用法展示
const Ajv = require("ajv")
const ajv = new Ajv()

const schema = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string"}
  },
  required: ["foo"],
  additionalProperties: false
}

const data = {foo: 1, bar: "abc"}
const valid = ajv.validate(schema, data)
if (!valid) console.log(ajv.errors)

*/

const phoneNumberSchema = {
    type: 'object',
    // phoneNumber是必须要有的，isRemoteTest 不是必须的
    required: ['phoneNumber'],
    properties: {
        phoneNumber: { type: 'string', pattern: '^1[34578]\\d{9}$' },
        isRemoteTest: { type: 'boolean' },
    },
}
const phoneNumberVerifyCodeSchema = {
    type: 'object',
    required: ['phoneNumber', 'verifyCode'],
    properties: {
        phoneNumber: { type: 'string', pattern: '^1[34578]\\d{9}$' },
        verifyCode: { type: 'string', pattern: '^\\d{4}$' }, // 四位数字
    },
}

module.exports = {
    phoneNumberSchema,
    phoneNumberVerifyCodeSchema,
}
