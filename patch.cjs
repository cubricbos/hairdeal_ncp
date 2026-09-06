const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  const updateFeatureItem = (
    index: number,
    key: keyof SiteSettings["features"]["items"][0],
    value: any,
  ) => {
    const newItems = [...draft.features.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };`,
`  const updateFeatureItem = (
    index: number,
    key: keyof SiteSettings["features"]["items"][0],
    value: any,
  ) => {
    const currentItems = draft.features?.items || [];
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [key]: value };
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };`
);

content = content.replace(
`  const addFeatureItem = () => {
    const newItem = {
      id: Date.now().toString(),
      hidden: false,
      icon: 'Star',
      title: '새로운 기능',
      description: '새로운 기능에 대한 설명을 입력하세요.'
    };
    setDraft({ ...draft, features: { ...draft.features, items: [...draft.features.items, newItem] } });
  };`,
`  const addFeatureItem = () => {
    const newItem = {
      id: Date.now().toString(),
      hidden: false,
      icon: 'Star',
      title: '새로운 기능',
      description: '새로운 기능에 대한 설명을 입력하세요.'
    };
    const currentItems = draft.features?.items || [];
    setDraft({ ...draft, features: { ...draft.features, items: [...currentItems, newItem] } });
  };`
);

content = content.replace(
`  const deleteFeatureItem = (index: number) => {
    const newItems = draft.features.items.filter((_, i) => i !== index);
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };`,
`  const deleteFeatureItem = (index: number) => {
    const currentItems = draft.features?.items || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };`
);

fs.writeFileSync(file, content);
console.log('patched methods');
