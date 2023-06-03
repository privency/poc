import {CredentialBuilder, CredentialSchema, SUBJECT_STR, initializeWasm, SignatureParamsG1, SIGNATURE_PARAMS_LABEL_BYTES, KeypairG2, AttributeBoundPseudonym, Statement, Statements, ProofSpecG1, MetaStatements, Witness, Witnesses, CompositeProofG1} from "@docknetwork/crypto-wasm-ts";

import crypto from 'crypto'


// User creates a proof that it knows the secret key and attributes used in the pseudonym and verifier verifies the proof
function registerUsingAttributeBoundPseudonym(
  pseudonym: AttributeBoundPseudonym,
  basesForAttributes: Uint8Array[],
  attributes: Uint8Array[],
  baseForSecretKey?: Uint8Array,
  secretKey?: Uint8Array
): CompositeProofG1 {
  const statement = Statement.attributeBoundPseudonym(pseudonym, basesForAttributes, baseForSecretKey);
  const statements = new Statements();
  statements.add(statement);

  const proofSpec = new ProofSpecG1(statements, new MetaStatements());

  const witness = Witness.attributeBoundPseudonym(attributes, secretKey);
  const witnesses = new Witnesses();
  witnesses.add(witness);

  const proof = CompositeProofG1.generate(proofSpec, witnesses);
  return proof

  // expect(proof.verify(proofSpec).verified).toEqual(true);
}

// bbs+ signs on encrypted string only support 32 bytes: https://github.com/nicobao/crypto-wasm-ts/blob/bc11e0f94a79372f34c79a29af77bca318dc5f54/src/bbs-plus/signature.ts#L19
// ... but UUIDv4 is 36 bytes long
// so we use some crypto random 16 bytes long string (a token)
function getCryptoRandomUID(): string {
  const buffer = crypto.randomBytes(16)
  const token = buffer.toString('hex');
  return token
}

(async () => {
  await initializeWasm();
  const params = SignatureParamsG1.generate(1, SIGNATURE_PARAMS_LABEL_BYTES);
  const keypair = KeypairG2.generate(params);
  const sk = keypair.sk;
  const pk = keypair.pk;

  const schema = CredentialSchema.essential()

  schema.properties[SUBJECT_STR] = {
    type: 'object',
    properties: {
      fname: {type: 'string'},
      lname: {type: 'string'},
      status: {type: 'string'}, // STUDENT or STAFF or FACULTY
      sensitive: {
        type: 'object',
        properties: {
          email: {type: 'string'},
          phone: {type: 'string'},
          INE: {$ref: '#/definitions/encryptableString'},
          UID: {$ref: '#/definitions/encryptableString'} // ESSEC ID
        }
      }
    }
  };
  const credSchema = new CredentialSchema(schema);

  console.log('schema', credSchema)


  const builder = new CredentialBuilder();
  builder.schema = credSchema;

  builder.subject = {
    fname: 'Alice',
    lname: 'Dupont',
    status: 'Student',
    sensitive: {
      phone: '0612345678',
      email: 'alice.dupont@example.com',
      INE: '1234567890G',
      UID: getCryptoRandomUID()
    }
  };

  const cred = builder.sign(sk);

  console.log('cred', cred)

  console.log('verify', cred.verify(pk))

})();
