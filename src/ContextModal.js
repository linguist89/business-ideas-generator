import React from 'react';
import { Button, Modal, Tabs } from 'flowbite-react';

export default function DefaultModal({ content, title }) {
  const [openModal, setOpenModal] = React.useState(undefined);
  const props = { openModal, setOpenModal };

  return (
    <>
      <Button onClick={() => props.setOpenModal('default')}>Show</Button>
      <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body>
          <Tabs.Group
            aria-label="Context Tabs"
            // eslint-disable-next-line
            style="underline"
          >
            <Tabs.Item active title="Consumer Pain Point">
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {content && content['Consumer Pain Point']}
              </p>
            </Tabs.Item>
            <Tabs.Item title="Effort">
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {content && content['Effort']}
              </p>
            </Tabs.Item>
            <Tabs.Item title="Time">
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {content && content['Time']}
              </p>
            </Tabs.Item>
          </Tabs.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => props.setOpenModal(undefined)}>Save</Button>
          <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
            Exit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
