import assert from 'node:assert/strict';
import { CHILD_INTERFACE_POLICY } from '../src/core/child-interface-policy.js';
import { getChildInteractionContract } from '../src/core/child-interaction-contract.js';
import { getContentCoverageGaps } from '../src/core/content-coverage.js';
import { childVisualLibrarySize, getVisualAssetManifest } from '../src/core/child-visual-system.js';

const ageIds = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];

for (const ageId of ageIds) {
  const policy = CHILD_INTERFACE_POLICY[ageId];
  assert.ok(policy, `política ausente: ${ageId}`);
  assert.ok(policy.maxChoices >= 2 && policy.maxChoices <= 5, `maxChoices inválido: ${ageId}`);
  assert.ok(policy.visualScale, `escala visual ausente: ${ageId}`);
  const contract = getChildInteractionContract(ageId);
  assert.ok(contract.touchTargetPx >= 56, `touch target abaixo do mínimo: ${ageId}`);
  assert.equal(contract.pressure, false, `pressão competitiva detectada: ${ageId}`);
}

assert.equal(getContentCoverageGaps().length, 0, 'há faixa etária sem conteúdo');
assert.ok(childVisualLibrarySize() >= 10, 'biblioteca visual pequena demais');
assert.ok(Object.keys(getVisualAssetManifest()).length === childVisualLibrarySize());

console.log('CHILD INTERFACE AUDIT PASS');
