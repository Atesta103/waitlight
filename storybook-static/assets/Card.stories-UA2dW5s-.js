import{t as e}from"./jsx-runtime-DqwUiDpP.js";import{n as t,r as n,t as r}from"./Card-Bze3wy0t.js";import{t as i}from"./Button-BrhWPZIc.js";var a=e(),o={title:`UI/Card`,component:r,tags:[`autodocs`],argTypes:{as:{control:`select`,options:[`div`,`section`,`article`]}}},s={args:{children:`Contenu de la carte.`}},c={render:()=>(0,a.jsxs)(r,{className:`w-80`,children:[(0,a.jsxs)(n,{children:[(0,a.jsx)(`h2`,{className:`text-lg font-bold text-text-primary`,children:`Titre`}),(0,a.jsx)(i,{variant:`ghost`,size:`sm`,children:`Action`})]}),(0,a.jsx)(t,{children:(0,a.jsx)(`p`,{className:`text-sm text-text-secondary`,children:`Contenu de la carte avec un en-tête.`})})]})},l={render:()=>(0,a.jsxs)(r,{as:`article`,className:`w-80`,children:[(0,a.jsx)(n,{children:(0,a.jsx)(`h2`,{className:`text-base font-semibold text-text-primary`,children:`Statistiques du jour`})}),(0,a.jsxs)(t,{children:[(0,a.jsx)(`p`,{className:`text-3xl font-bold text-brand-primary`,children:`47`}),(0,a.jsx)(`p`,{className:`text-sm text-text-secondary`,children:`clients servis`})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Contenu de la carte."
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
            <CardHeader>
                <h2 className="text-lg font-bold text-text-primary">Titre</h2>
                <Button variant="ghost" size="sm">
                    Action
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-text-secondary">
                    Contenu de la carte avec un en-tête.
                </p>
            </CardContent>
        </Card>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Card as="article" className="w-80">
            <CardHeader>
                <h2 className="text-base font-semibold text-text-primary">
                    Statistiques du jour
                </h2>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-brand-primary">47</p>
                <p className="text-sm text-text-secondary">clients servis</p>
            </CardContent>
        </Card>
}`,...l.parameters?.docs?.source}}};var u=[`Default`,`WithHeader`,`FullExample`];export{s as Default,l as FullExample,c as WithHeader,u as __namedExportsOrder,o as default};