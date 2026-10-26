// Pixel rectangles are measured against the untouched source images.
// Generative edits are composited ONLY inside these five non-overlapping regions.
export const scenes = [
  { id: 'balcony', title: 'A little balcony break', subtitle: 'Lemonade, sunshine & nowhere to be', source: 'image.png', width: 1086, height: 1448, edits: [
    [305, 505, 49, 75, 'The phone case', 'change the left squirrel’s black smartphone case to muted burgundy', 'change the left squirrel’s black smartphone case to dusty blue'],
    [480, 748, 67, 61, 'The dotted cup', 'change the blue polka dots on the left table cup to soft red', 'change the blue polka dots on the left table cup to sage green'],
    [665, 792, 60, 64, 'The striped cup', 'change the yellow stripes on the right table cup to soft blue', 'change the yellow stripes on the right table cup to soft lavender'],
    [938, 899, 70, 49, 'The little fish', 'change only the middle orange goldfish in the pond to pale cream', 'change only the middle orange goldfish in the pond to pale pink'],
    [176, 1214, 48, 48, 'The slipper embroidery', 'replace the blue cat-face embroidery on the LEFT slipper with a tiny blue heart', 'replace the blue cat-face embroidery on the LEFT slipper with a tiny blue star'],
  ] },
  { id: 'sunset', title: 'The long way home', subtitle: 'Good company & a golden sky', source: 'image (1).png', width: 1672, height: 941, edits: [
    [1510, 450, 85, 58, 'A duck on the lake', 'change the little white duck’s body to pale pink', 'change the little white duck’s body to pale yellow'],
    [1005, 640, 74, 73, 'The green shirt motif', 'remove the lowest dark square from the white seal’s green shirt motif', 'change the dark block motif on the white seal’s green shirt to muted purple'],
    [1312, 674, 43, 45, 'A tree on the koala’s shirt', 'remove the bottom-center tree motif from the koala’s shirt', 'change only the bottom-center tree on the koala’s shirt to a small dark green heart'],
    [350, 482, 78, 62, 'A little shirt pocket', 'add one small pale blue pocket to the left squirrel’s gray shirt at its upper left chest', 'add one small cream pocket to the left squirrel’s gray shirt at its upper left chest'],
    [631, 259, 42, 27, 'The faraway roof', 'change the orange roof of the small distant house above the smaller squirrel to dusty blue', 'change the orange roof of the small distant house above the smaller squirrel to sage green'],
  ] },
  { id: 'night-workout', title: 'Just one more rep', subtitle: 'A tiny workout before bedtime', source: 'image (2).png', width: 1672, height: 941, edits: [
    [216, 606, 87, 72, 'The water bottle cap', 'change the blue water bottle cap on the lower-left table to muted coral', 'change the blue water bottle cap on the lower-left table to sage green'],
    [127, 467, 66, 42, 'The sleeping cat’s muzzle', 'change the sleeping cat’s pale lavender muzzle to pale cream', 'change the sleeping cat’s pale lavender muzzle to pale pink'],
    [1190, 645, 60, 57, 'The spotted towel', 'change the pale blue dots in the CENTER of the floor towel to soft pink', 'change the pale blue dots in the CENTER of the floor towel to pale green'],
    [686, 607, 51, 93, 'The shorts stripes', 'remove one of the two white stripes on the squirrel’s left shorts leg', 'change the two white stripes on the squirrel’s left shorts leg to pale blue'],
    [1251, 141, 33, 40, 'The lit window', 'change the left lit window on the distant house through the window to warm yellow', 'change the left lit window on the distant house through the window to soft pink'],
  ] },
  { id: 'midnight-snack', title: 'A midnight snack', subtitle: 'One more banana, one more idea', source: 'image (3).png', width: 1672, height: 941, edits: [
    [234, 38, 75, 82, 'The moon', 'change the yellow crescent moon to pale cream', 'reverse the crescent moon so it faces the other way, within the same small area'],
    [263, 581, 84, 69, 'The dotted mug', 'change the pale blue dots on the left mug to soft pink', 'change the pale blue dots on the left mug to sage green'],
    [601, 552, 67, 74, 'The pencil cup stripes', 'change the blue stripes on the pencil holder to muted red', 'change the blue stripes on the pencil holder to muted green'],
    [638, 486, 25, 60, 'The green pencil', 'change only the green pencil in the pencil holder to yellow', 'change only the green pencil in the pencil holder to purple'],
    [1563, 167, 53, 80, 'The wall switch', 'add one small dark blue circular dot to the center of the wall switch at the far right', 'add one small cream circular dot to the center of the wall switch at the far right'],
  ] },
  { id: 'bakery', title: 'Fresh from the oven', subtitle: 'A warm welcome at the Squirrekery', source: 'image (4).png', width: 1672, height: 940, edits: [
    [203, 805, 58, 45, 'The bird’s wing', 'change the little bird’s yellow wing to pale blue', 'change the little bird’s yellow wing to pale pink'],
    [692, 313, 40, 48, 'The doorbell', 'change the yellow hanging doorbell to pale blue', 'change the yellow hanging doorbell to muted red'],
    [1093, 251, 76, 43, 'The pendant light', 'change the blue pendant lamp shade over the squirrel to sage green', 'change the blue pendant lamp shade over the squirrel to muted pink'],
    [1371, 738, 30, 27, 'A cherry on a bun', 'change the cherry on the LEFT cream-topped bun to blue', 'change the cherry on the LEFT cream-topped bun to golden yellow'],
    [1469, 525, 38, 40, 'The utensil pot', 'add a small pale blue heart on the white utensil pot on the right counter', 'add a small yellow star on the white utensil pot on the right counter'],
  ] },
  { id: 'homework', title: 'A very full desk', subtitle: 'Little problems, a little patience', source: 'image (5).png', width: 1672, height: 941, edits: [
    [1024, 27, 80, 78, 'The moon', 'change the yellow crescent moon to pale pink', 'change the yellow crescent moon to pale cream'],
    [1281, 657, 70, 57, 'The mug illustration', 'replace the small cat face on the yellow mug with a tiny cream heart', 'replace the small cat face on the yellow mug with a tiny cream star'],
    [979, 672, 66, 36, 'The eraser', 'change the blue half of the eraser on the desk to pink', 'change the blue half of the eraser on the desk to green'],
    [1561, 131, 71, 54, 'The fridge magnet', 'change the yellow cat-shaped fridge magnet to pale blue', 'change the yellow cat-shaped fridge magnet to pale pink'],
    [1338, 139, 38, 56, 'The framed flower', 'change the yellow petals of the flower in the wall frame at right to pink', 'change the yellow petals of the flower in the wall frame at right to pale blue'],
  ] },
  { id: 'blossoms', title: 'Under the blossoms', subtitle: 'A familiar walk feels new again', source: 'image (6).png', width: 1672, height: 940, edits: [
    [444, 496, 57, 38, 'The white bear’s ears', 'change the white bear’s pink inner ears to pale yellow', 'change the white bear’s pink inner ears to pale blue'],
    [648, 657, 42, 18, 'The suitcase wheels', 'change the two dark suitcase wheels to muted red', 'change the two dark suitcase wheels to muted blue'],
    [1100, 474, 32, 21, 'The distant bin', 'change the top of the blue-gray trash bin near the distant bus stop to muted yellow', 'change the top of the blue-gray trash bin near the distant bus stop to muted pink'],
    [352, 155, 26, 31, 'The distant window', 'change only the upper LEFT blue window on the small distant building to pale yellow', 'change only the upper LEFT blue window on the small distant building to pale pink'],
    [549, 566, 33, 35, 'The brown bear’s paw', 'add a tiny cream heart on the brown bear’s front paw', 'add a tiny pale blue dot on the brown bear’s front paw'],
  ] },
  { id: 'morning-stretch', title: 'A softer kind of morning', subtitle: 'Stretch a little. Slow down a little.', source: 'image (7).png', width: 1672, height: 941, edits: [
    [241, 360, 67, 60, 'The bottle cap', 'change the blue water bottle lid to muted pink', 'change the blue water bottle lid to sage green'],
    [1539, 317, 67, 58, 'The mug dots', 'change the blue dots on the mug at upper right to muted pink', 'change the blue dots on the mug at upper right to muted green'],
    [1083, 218, 55, 60, 'The dumbbell end', 'change only the LEFT end of the pink dumbbell at top center to pale blue', 'change only the LEFT end of the pink dumbbell at top center to pale green'],
    [198, 553, 89, 78, 'The folded towel', 'change the blue stripes in the CENTER of the folded towel to pale pink', 'change the blue stripes in the CENTER of the folded towel to pale green'],
    [1412, 696, 41, 23, 'The sleepy cat’s nose', 'change the sleeping cat’s dark nose to soft pink', 'change the sleeping cat’s dark nose to muted brown'],
  ] },
  { id: 'together', title: 'Better when we’re together', subtitle: 'Something good is always worth sharing', source: 'image (8).png', width: 1536, height: 1024, edits: [
    [878, 405, 84, 37, 'The brown bear’s tongue', 'change the brown bear’s pink tongue to muted red', 'change the brown bear’s pink tongue to pale peach'],
    [577, 414, 77, 41, 'The white bear’s tongue', 'change the white bear’s pink tongue to muted red', 'change the white bear’s pink tongue to pale peach'],
    [928, 215, 30, 43, 'The little blue window', 'change the blue window on the distant house directly above the brown bear to pale pink', 'change the blue window on the distant house directly above the brown bear to pale yellow'],
    [130, 856, 53, 49, 'The left daisy center', 'change the yellow center of the bottom-left daisy to soft pink', 'change the yellow center of the bottom-left daisy to pale blue'],
    [1374, 874, 55, 43, 'The right daisy center', 'change the yellow center of the bottom-right daisy to soft pink', 'change the yellow center of the bottom-right daisy to pale blue'],
  ] },
];

export function promptFor(scene, variant) {
  return `Use case: precise-object-edit. Edit target: the supplied watercolor illustration for a find-the-differences game. Return the SAME image at ${scene.width}x${scene.height}, same framing, pixel alignment, composition, lines, textures, characters and text. Make EXACTLY these FIVE small changes and NOTHING ELSE:\n${scene.edits.map((e, i) => `${i + 1}) In source pixel rectangle x=${e[0]}, y=${e[1]}, width=${e[2]}, height=${e[3]}: ${e[variant + 4]}.`).join('\n')}\nPreserve every other detail exactly. Keep edits subtle but visible. Do not move any objects. No circles, arrows, labels or other additions. The edited image will be composited back into the original only within the named rectangles, so stay precisely aligned.`;
}

// Final bounds follow the observed edits rather than the generator's intended placement.
export function finalEdits(scene,variant){
  const edits=scene.edits.map(e=>[...e]);
  if(scene.id==='sunset')edits[3]=[438,482,57,54,'A little shirt pocket','A pale blue pocket appears on the gray shirt','A cream pocket appears on the gray shirt'];
  if(scene.id==='bakery')edits[4]=[1547,514,43,42,'The flower vase','A pale blue heart appears on the white flower vase','A yellow star appears on the white flower vase'];
  if(scene.id==='blossoms'&&variant===2)edits[3]=[130,48,53,46,'A window near the treetops','The distant window turns yellow','The high window on the far-left building turns pink'];
  if(scene.id==='together')edits[2]=[970,211,35,47,'The little blue window','The right window above the brown bear turns pink','The right window above the brown bear turns pale yellow'];
  return edits;
}
