const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
console.log('🧪 Starting Cards Gallery & Cards HTML Verification Suite...\n');

// 1. Verify cards.html exists and has required elements
const cardsHtmlPath = path.join(rootDir, 'cards.html');
assert(fs.existsSync(cardsHtmlPath), 'cards.html must exist');
const html = fs.readFileSync(cardsHtmlPath, 'utf8');

assert(html.includes('cards-gallery.js'), 'cards.html must import cards-gallery.js');
assert(html.includes('cardPreviewBox'), 'cards.html must have cardPreviewBox');
assert(html.includes('cardPreviewInfo'), 'cards.html must have cardPreviewInfo');
assert(html.includes('cardsGrid'), 'cards.html must have cardsGrid');
console.log('✅ cards.html verified with complete stage & grid DOM structure.');

// 2. Verify cards-gallery.js exists, complies with Rule 7, and has 20 cards
const galleryJsPath = path.join(rootDir, 'cards-gallery.js');
assert(fs.existsSync(galleryJsPath), 'cards-gallery.js must exist');
const lines = fs.readFileSync(galleryJsPath, 'utf8').split('\n').length;
assert(lines < 400, `cards-gallery.js must have < 400 lines (found ${lines})`);
console.log(`✅ cards-gallery.js strictly complies with Rule 7 (${lines} < 400 lines).`);

// 3. Test cards-gallery logic
require(galleryJsPath);
const gallery = global.ScoreARCardsGallery;
assert(gallery, 'global.ScoreARCardsGallery must be attached');
assert.strictEqual(gallery.CARDS.length, 20, 'Must have exactly 20 cards');

const categories = ['game_changer', 'attack', 'defense', 'boost'];
categories.forEach(cat => {
  const cardsInCat = gallery.getCards(cat);
  assert.strictEqual(cardsInCat.length, 5, `Category ${cat} must contain exactly 5 cards`);
});
console.log('✅ All 4 tactical categories verified with exactly 5 cards each (20 total).');

// 4. Test renderGrid and renderPreview
const dummyContainer = { innerHTML: '' };
const dummyStage = { innerHTML: '' };
const dummyTitle = { innerHTML: '' };

gallery.renderGrid(dummyContainer, 'all', 'SWAP_STUDENT');
assert(dummyContainer.innerHTML.length > 500, 'renderGrid must generate HTML');

gallery.renderPreview(dummyStage, dummyTitle, 'SWAP_STUDENT');
assert(dummyStage.innerHTML.includes('SWAP_STUDENT') || dummyStage.innerHTML.includes('card_swap_student.jpg'));
assert(dummyTitle.innerHTML.includes('تبديل المراكز'));
console.log('✅ renderGrid and renderPreview methods verified.');

console.log('\n🎉 ALL CARDS GALLERY TESTS PASSED SUCCESSFULLY! 🚀');
