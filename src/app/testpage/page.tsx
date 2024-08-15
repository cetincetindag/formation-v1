"use client"
import { Flex, ActionGroup, darkTheme, Item, Provider, Text } from '@adobe/react-spectrum';
import Draw from '@spectrum-icons/workflow/Draw';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';

const Page = () => {
  return (
    <main className="flex flex-col justify-center items-center">
      <div className="fixed overflow-auto">
        <Provider theme={darkTheme}>
          <Flex justifyContent='end'>
            <ActionGroup>
              <Item key="edit">
                <Draw />
                <Text>Edit</Text>
              </Item>
              <Item key="copy">
                <Copy />
                <Text>Copy</Text>
              </Item>
              <Item key="delete">
                <Delete />
                <Text>Delete</Text>
              </Item>
            </ActionGroup>
          </Flex>
        </Provider>
      </div>
      <div>
        <Flex justifyContent='center'>
          <canvas className="size-72">
          </canvas>
        </Flex>
      </div>
    </main>
  )
};


export default Page;
