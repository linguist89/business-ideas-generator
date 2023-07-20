import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Cross2Icon } from '@radix-ui/react-icons';
import './Buttons.css';
import './ContextDialog.css';

export default function ContextDialog({ content, title }) {
  React.useEffect(() => {
    console.log(content['Consumer Pain Point']);
    console.log(content['Effort']);
    console.log(content['Time']);
  })
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="solid-card-button">Show</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ContextDialogOverlay" />
        <Dialog.Content className="ContextDialogContent">
          <Dialog.Title className="ContextDialogTitle">{title}</Dialog.Title>
          <Tabs.Root className="TabsRoot" defaultValue="Consumer Pain Point">
            <Tabs.List className="TabsList" aria-label="Context Tabs">
              <Tabs.Trigger className="TabsTrigger solid-card-button" value="Consumer Pain Point">
                Consumer Pain Point
              </Tabs.Trigger>
              <Tabs.Trigger className="TabsTrigger solid-card-button" value="Effort">
                Effort
              </Tabs.Trigger>
              <Tabs.Trigger className="TabsTrigger solid-card-button" value="Time">
                Time
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content className="TabsContent" value="Consumer Pain Point">
              <ul>
                {content && content['Consumer Pain Point'].map((item, index) => (
                  <li key={index}>{item.point}</li>
                ))}
              </ul>
            </Tabs.Content>
            <Tabs.Content className="TabsContent" value="Effort">
              <ul>
                {content && content['Effort'].map((item, index) => (
                  <li key={index}>{item.point}</li>
                ))}
              </ul>
            </Tabs.Content>
            <Tabs.Content className="TabsContent" value="Time">
              <ul>
                {content && content['Time'].map((item, index) => (
                  <li key={index}>{item.point}</li>
                ))}
              </ul>
            </Tabs.Content>

          </Tabs.Root>
          <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
            <Dialog.Close asChild>
              <button className="Button green">Save</button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
