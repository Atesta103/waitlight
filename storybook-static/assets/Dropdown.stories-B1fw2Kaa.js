import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{t}from"./createLucideIcon--cH2C-2t.js";import{n,t as r}from"./Dropdown-CiBOTSL1.js";import{t as i}from"./trash-2-DwUuNb_G.js";import{t as a}from"./Button-BrhWPZIc.js";var o=t(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),s=t(`square-pen`,[[`path`,{d:`M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7`,key:`1m0v6g`}],[`path`,{d:`M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z`,key:`ohrbg2`}]]),c=e(),l={title:`UI/Dropdown`,component:r,tags:[`autodocs`]},u={render:()=>(0,c.jsx)(r,{trigger:(0,c.jsx)(a,{variant:`ghost`,size:`md`,"aria-label":`Options`,children:(0,c.jsx)(n,{size:18})}),items:[{label:`Modifier`,icon:(0,c.jsx)(s,{size:16}),onClick:()=>{}},{label:`Dupliquer`,icon:(0,c.jsx)(o,{size:16}),onClick:()=>{}},{label:`Supprimer`,icon:(0,c.jsx)(i,{size:16}),variant:`destructive`,onClick:()=>{}}]})},d={render:()=>(0,c.jsx)(r,{trigger:(0,c.jsx)(a,{variant:`secondary`,children:`Options`}),items:[{label:`Appeler`,onClick:()=>{}},{label:`Terminer`,onClick:()=>{},disabled:!0},{label:`Annuler le ticket`,icon:(0,c.jsx)(i,{size:16}),variant:`destructive`,onClick:()=>{}}]})},f={render:()=>(0,c.jsx)(`div`,{className:`flex w-80 justify-end`,children:(0,c.jsx)(r,{align:`left`,trigger:(0,c.jsx)(a,{variant:`ghost`,children:`Menu gauche`}),items:[{label:`Item 1`,onClick:()=>{}},{label:`Item 2`,onClick:()=>{}}]})})};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown trigger={<Button variant="ghost" size="md" aria-label="Options">
                    <MoreVertical size={18} />
                </Button>} items={[{
    label: "Modifier",
    icon: <Edit size={16} />,
    onClick: () => {}
  }, {
    label: "Dupliquer",
    icon: <Copy size={16} />,
    onClick: () => {}
  }, {
    label: "Supprimer",
    icon: <Trash2 size={16} />,
    variant: "destructive",
    onClick: () => {}
  }]} />
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown trigger={<Button variant="secondary">Options</Button>} items={[{
    label: "Appeler",
    onClick: () => {}
  }, {
    label: "Terminer",
    onClick: () => {},
    disabled: true
  }, {
    label: "Annuler le ticket",
    icon: <Trash2 size={16} />,
    variant: "destructive",
    onClick: () => {}
  }]} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-80 justify-end">
            <Dropdown align="left" trigger={<Button variant="ghost">Menu gauche</Button>} items={[{
      label: "Item 1",
      onClick: () => {}
    }, {
      label: "Item 2",
      onClick: () => {}
    }]} />
        </div>
}`,...f.parameters?.docs?.source}}};var p=[`Default`,`WithDisabledItem`,`LeftAligned`];export{u as Default,f as LeftAligned,d as WithDisabledItem,p as __namedExportsOrder,l as default};