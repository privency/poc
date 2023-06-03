"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_wasm_ts_1 = require("@docknetwork/crypto-wasm-ts");
const crypto_1 = __importDefault(require("crypto"));
// encoded in base64 because bbs+ sign on encrypted string only support 32 bytes: https://github.com/nicobao/crypto-wasm-ts/blob/bc11e0f94a79372f34c79a29af77bca318dc5f54/src/bbs-plus/signature.ts#L19
// ... but UUIDv4 is 36 bytes long
function getRandomUUID() {
    const buffer = crypto_1.default.randomBytes(16);
    const token = buffer.toString('hex');
    return token;
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, crypto_wasm_ts_1.initializeWasm)();
    const params = crypto_wasm_ts_1.SignatureParamsG1.generate(1, crypto_wasm_ts_1.SIGNATURE_PARAMS_LABEL_BYTES);
    const keypair = crypto_wasm_ts_1.KeypairG2.generate(params);
    const sk = keypair.sk;
    const pk = keypair.pk;
    const schema = crypto_wasm_ts_1.CredentialSchema.essential();
    schema.properties[crypto_wasm_ts_1.SUBJECT_STR] = {
        type: 'object',
        properties: {
            fname: { type: 'string' },
            lname: { type: 'string' },
            status: { type: 'string' },
            sensitive: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    INE: { $ref: '#/definitions/encryptableString' },
                    UUID: { $ref: '#/definitions/encryptableString' } // ESSEC ID
                }
            }
        }
    };
    const credSchema = new crypto_wasm_ts_1.CredentialSchema(schema);
    console.log('schema', credSchema);
    const builder = new crypto_wasm_ts_1.CredentialBuilder();
    builder.schema = credSchema;
    builder.subject = {
        fname: 'Alice',
        lname: 'Dupont',
        status: 'Student',
        sensitive: {
            phone: '0612345678',
            email: 'alice.dupont@example.com',
            INE: '1234567890G',
            UUID: getRandomUUID()
        }
    };
    const cred = builder.sign(sk);
    console.log('cred', cred);
    console.log('verify', cred.verify(pk));
}))();
//# sourceMappingURL=index.js.map