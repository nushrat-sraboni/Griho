// apps/staff/src/screens/MessagesFlow.tsx
//
// Everything about messages, as one piece both the manager workspace and the guard
// workspace use: the chat list, the "New message" screen, and a chat. It remembers
// which of the three is showing. The chat list keeps the bottom menu (passed in as
// `footer`) with a floating "New message" button above it. The "New message" screen
// and the chat fill the whole screen, like the design. Owned by Sraboni.

import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Screen from '../components/Screen';
import type { ChatTarget } from '../chatTarget';
import { colors } from '../styles';
import ChatScreen from './ChatScreen';
import MessagesListScreen from './MessagesListScreen';
import NewMessageScreen from './NewMessageScreen';

type Page = { name: 'list' } | { name: 'new' } | { name: 'chat'; target: ChatTarget };

type Props = {
  displayName: string;
  buildingName: string;
  /** The bottom menu, shown under the chat list. */
  footer: ReactNode;
  /** Called after a message is sent or deleted, so other screens can read new numbers. */
  onChanged: () => void;
};

export default function MessagesFlow({ displayName, buildingName, footer, onChanged }: Props) {
  const [view, setView] = useState<Page>({ name: 'list' });
  // Goes up by one when the chat list must read the chats again.
  const [refreshKey, setRefreshKey] = useState(0);

  function backToList() {
    setRefreshKey((k) => k + 1);
    setView({ name: 'list' });
  }

  if (view.name === 'chat') {
    return (
      <ChatScreen
        target={view.target}
        buildingName={buildingName}
        onBack={backToList}
        onChanged={onChanged}
      />
    );
  }

  if (view.name === 'new') {
    return (
      <Screen>
        <NewMessageScreen
          buildingName={buildingName}
          onBack={backToList}
          onOpenChat={(target) => setView({ name: 'chat', target })}
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View>
          <View style={local.fabRow}>
            <Pressable
              style={local.fab}
              onPress={() => setView({ name: 'new' })}
              accessibilityRole="button"
              accessibilityLabel="New message"
            >
              <Text style={local.fabText}>+ New message</Text>
            </Pressable>
          </View>
          {footer}
        </View>
      }
    >
      <MessagesListScreen
        displayName={displayName}
        refreshKey={refreshKey}
        onOpenChat={(target) => setView({ name: 'chat', target })}
      />
    </Screen>
  );
}

const local = StyleSheet.create({
  fabRow: { alignItems: 'flex-end', paddingRight: 24, marginBottom: 10 },
  fab: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
