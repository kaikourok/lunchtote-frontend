import '@/styles/sanitize.css';
import '@/styles/global.scss';
import '@/styles/room-message/index.scss';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SWRConfig } from 'swr';

import DefaultLayout from '@/layouts/DefaultLayout';
import axios from 'plugins/axios';
import store from 'store';
import { fetchDataRequest, notify } from 'store/actions/character';
import { selectCharacter } from 'store/selector/character';

type AppPropsWithLayout = AppProps & {
  Component: AppProps['Component'] & {
    getLayout?: (page: React.ReactNode) => JSX.Element;
  };
};

const AppInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDataRequest());
  }, []);

  return null;
};

const NotificationHandler = () => {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);

  /*useEffect(() => {
    let ws: WebSocket;

    if (character.id != null) {
      const connectWebSocket = () => {
        ws = new WebSocket('ws://localhost:3000/');

        ws.onclose = () => {
          console.log('ws closed');
          connectWebSocket();
        };

        ws.onopen = () => {
          console.log('WebSocket Connected.');
          ws.send(character.notificationToken);
        };

        ws.onmessage = (event: MessageEvent<string>) => {
          dispatch(
            notify({
              message: event.data,
            })
          );
        };
      };

      connectWebSocket();

      return () => {
        ws.close();
      };
    }
  }, [character.id]);*/

  return <></>;
};

const App: NextPage<AppPropsWithLayout> = ({ Component, pageProps }) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <>
      <Provider store={store}>
        <SWRConfig
          value={{
            fetcher: (url) => axios.get(url).then((res) => res.data),
            revalidateOnFocus: false,
          }}
        >
          <AppInit />
          <Head>
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1.0"
            />
          </Head>
          <Toaster
            containerStyle={{
              zIndex: 10000000,
            }}
            toastOptions={{
              duration: 4000,
              position: 'bottom-right',
              style: {
                zIndex: 1000001,
              },
            }}
          />
          <NotificationHandler />
          {getLayout(
            <>
              <Component {...pageProps} />
            </>
          )}
        </SWRConfig>
      </Provider>
    </>
  );
};

export default App;
