import * as EmailValidator from 'email-validator';
import { NextPage } from 'next';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactToggle from 'react-toggle';

import Button from '@/components/atoms/Button/Button';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import HelpButton from '@/components/molecules/Help/Help';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/settings/general.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
const apiPath = process.env.NEXT_PUBLIC_API_PATH!;

const NoticeSetting = (props: {
  value: boolean;
  onChange: () => void;
  children: ReactNode;
}) => {
  return (
    <div className={styles['notice-setting']}>
      <div className={styles['notice-description']}>{props.children}</div>
      <div className={styles['toggle-wrapper']}>
        <ReactToggle
          icons={false}
          checked={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
};

const NoticeSettings = (props: {
  followed: boolean;
  replied: boolean;
  subscribe: boolean;
  newMember: boolean;
  mail: boolean;
  onFollowedChange: () => void;
  onRepliedChange: () => void;
  onSubscribeChange: () => void;
  onNewMemberChange: () => void;
  onMailChange: () => void;
}) => {
  return (
    <div className={styles['notice-settings']}>
      <NoticeSetting value={props.followed} onChange={props.onFollowedChange}>
        フォローされた際に通知する
      </NoticeSetting>
      <NoticeSetting value={props.replied} onChange={props.onRepliedChange}>
        返信された際に通知する
      </NoticeSetting>
      <NoticeSetting value={props.mail} onChange={props.onMailChange}>
        ゲーム内メールに新着があった際に通知する
      </NoticeSetting>
      <NoticeSetting value={props.subscribe} onChange={props.onSubscribeChange}>
        対象ルームに新規メッセージの投稿があった際に通知する
        <HelpButton>
          トークルーム画面にて新規メッセージ通知をONにしたルームで新規メッセージがあった際に通知します。
        </HelpButton>
      </NoticeSetting>
      <NoticeSetting value={props.newMember} onChange={props.onNewMemberChange}>
        対象ルームに新規メンバーが参加した際に通知する
        <HelpButton>
          トークルーム画面にて新規メンバー通知をONにしたルームで新規メンバーが参加した際に通知します。
        </HelpButton>
      </NoticeSetting>
    </div>
  );
};

const LinkedState = (props: {
  target: string;
  state: boolean;
  onLink: () => void;
  onUnlink: () => void;
}) => {
  return (
    <div className={styles['signin-link']}>
      <div className={styles['signin-link-target']}>{props.target}</div>
      <div className={styles['signin-link-state']}>
        {props.state ? '提携済' : '未提携'}
      </div>
      <Button
        onClick={() => {
          if (props.state) {
            props.onUnlink();
          } else {
            props.onLink();
          }
        }}
      >
        {props.state ? '提携解除' : '提携する'}
      </Button>
    </div>
  );
};

const SettingsGeneral: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookFollowed, setWebhookFollowed] = useState(false);
  const [webhookReplied, setWebhookReplied] = useState(false);
  const [webhookSubscribe, setWebhookSubscribe] = useState(false);
  const [webhookNewMember, setWebhookNewMember] = useState(false);
  const [webhookMail, setWebhookMail] = useState(false);
  const [notificationFollowed, setNotificationFollowed] = useState(false);
  const [notificationReplied, setNotificationReplied] = useState(false);
  const [notificationSubscribe, setNotificationSubscribe] = useState(false);
  const [notificationNewMember, setNotificationNewMember] = useState(false);
  const [notificationMail, setNotificationMail] = useState(false);
  const [otherSettingsStates, setOtherSettingsStates] = useState<{
    email: string | null;
    linkedStates: {
      twitter: boolean;
      google: boolean;
    };
  }>({
    email: null,
    linkedStates: {
      twitter: false,
      google: false,
    },
  });
  const [emailInput, setEmailInput] = useState('');
  const [unlinkTarget, setUnlinkTarget] = useState<'Twitter' | 'Google' | null>(
    null
  );
  const [emailRegisterRequested, setEmailRegisterRequested] = useState<
    string | null
  >(null);
  const [
    isEmailUnregisterConfirmModalOpen,
    setIsEmailUnregisterConfirmModalOpen,
  ] = useState(false);

  const [fetched, setFetched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        type Response = {
          email: string | null;
          linkedStates: {
            twitter: boolean;
            google: boolean;
          };
          webhook: {
            url: string;
            followed: boolean;
            replied: boolean;
            subscribe: boolean;
            newMember: boolean;
            mail: boolean;
          };
          notification: {
            followed: boolean;
            replied: boolean;
            subscribe: boolean;
            newMember: boolean;
            mail: boolean;
          };
        };

        const response = await axios.get<Response>(
          '/characters/main/settings/other'
        );

        setWebhookUrl(response.data.webhook.url);
        setWebhookFollowed(response.data.webhook.followed);
        setWebhookReplied(response.data.webhook.replied);
        setWebhookSubscribe(response.data.webhook.subscribe);
        setWebhookNewMember(response.data.webhook.newMember);
        setWebhookMail(response.data.webhook.mail);
        setNotificationFollowed(response.data.notification.followed);
        setNotificationReplied(response.data.notification.replied);
        setNotificationSubscribe(response.data.notification.subscribe);
        setNotificationNewMember(response.data.notification.newMember);
        setNotificationMail(response.data.notification.mail);
        setOtherSettingsStates({
          email: response.data.email,
          linkedStates: response.data.linkedStates,
        });
        setEmailInput(response.data.email ?? '');

        setFetched(true);
      } catch (e) {
        console.log(e);
        setFetchError(true);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  if (fetchError) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!fetched) {
    return (
      <DefaultPage>
        <Heading>その他設定</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="その他設定" />
      <Heading>その他設定</Heading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();

            (async () => {
              if (!csrfHeader) return;

              try {
                await toast.promise(
                  axios.post(
                    '/characters/main/settings/other',
                    {
                      webhook: {
                        url: webhookUrl,
                        followed: webhookFollowed,
                        replied: webhookReplied,
                        subscribe: webhookSubscribe,
                        newMember: webhookNewMember,
                        mail: webhookMail,
                      },
                      notification: {
                        followed: notificationFollowed,
                        replied: notificationReplied,
                        subscribe: notificationSubscribe,
                        newMember: notificationNewMember,
                        mail: notificationMail,
                      },
                    },
                    {
                      headers: csrfHeader,
                    }
                  ),
                  {
                    loading: '設定を更新しています',
                    success: '設定を更新しました',
                    error: '設定の更新中にエラーが発生しました',
                  }
                );
              } catch (e) {
                console.log(e);
              }
            })();
          }}
        >
          <InputForm.General
            label="Eメール"
            help={
              <>
                メールアドレスです。登録するとパスワードを紛失した際にも再発行を行えます。また、ログインIDとしても使用可能です。
              </>
            }
          >
            {otherSettingsStates.email == null && (
              <>
                <div className={styles['email']}>未登録</div>
                <div className={styles['email-inputs']}>
                  <input
                    type="email"
                    className={styles['email-input']}
                    placeholder="登録するメールアドレスを入力"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <Button
                    className={styles['email-confirm-button']}
                    disabled={!EmailValidator.validate(emailInput)}
                    onDisabledClick={() => {
                      toast.error('無効なメールアドレスです');
                    }}
                    onClick={async () => {
                      if (!csrfHeader) return;

                      try {
                        await toast.promise(
                          axios.post(
                            '/characters/main/settings/email',
                            {
                              email: emailInput,
                            },
                            {
                              headers: csrfHeader,
                            }
                          ),
                          {
                            loading: '認証用URLを送信しています',
                            success: '認証用URLを送信しました',
                            error: '認証用URLの送信中にエラーが発生しました',
                          }
                        );

                        setEmailRegisterRequested(emailInput);
                        setEmailInput('');
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                  >
                    確認メールを送信
                  </Button>
                </div>
                {emailRegisterRequested != null && (
                  <div className={styles['email-register-requested-message']}>
                    {emailRegisterRequested}
                    に認証用のURLを送信しました。認証用URLには有効期限がありますのでご注意ください。
                  </div>
                )}
              </>
            )}
            {otherSettingsStates.email != null && (
              <>
                <div className={styles['email-states']}>
                  <div className={styles['email']}>
                    {otherSettingsStates.email}
                  </div>
                  <Button
                    className={styles['email-unregister-button']}
                    onClick={() => setIsEmailUnregisterConfirmModalOpen(true)}
                  >
                    Eメールの登録解除
                  </Button>
                </div>
              </>
            )}
          </InputForm.General>
          <InputForm.General
            label="ログイン提携"
            help={
              <>
                提携することでログイン時にパスワード等を使わずログインすることができます。
              </>
            }
          >
            <div className={styles['signin-links']}>
              <LinkedState
                target="Twitter"
                state={otherSettingsStates.linkedStates.twitter}
                onLink={() => {
                  window.location.href =
                    backendUrl + apiPath + 'oauth/twitter?mode=register';
                }}
                onUnlink={() => setUnlinkTarget('Twitter')}
              />
              <LinkedState
                target="Google"
                state={otherSettingsStates.linkedStates.google}
                onLink={() => {
                  window.location.href =
                    backendUrl + apiPath + 'oauth/google?mode=register';
                }}
                onUnlink={() => setUnlinkTarget('Google')}
              />
            </div>
          </InputForm.General>
          <InputForm.General
            label="ゲーム内通知"
            help={
              <>選択したタイミングでゲーム内通知を受け取ることができます。</>
            }
          >
            <NoticeSettings
              followed={notificationFollowed}
              replied={notificationReplied}
              subscribe={notificationSubscribe}
              newMember={notificationNewMember}
              mail={notificationMail}
              onFollowedChange={() =>
                setNotificationFollowed(!notificationFollowed)
              }
              onRepliedChange={() =>
                setNotificationReplied(!notificationReplied)
              }
              onSubscribeChange={() =>
                setNotificationSubscribe(!notificationSubscribe)
              }
              onNewMemberChange={() => {
                setNotificationNewMember(!notificationNewMember);
              }}
              onMailChange={() => setNotificationMail(!notificationMail)}
            />
          </InputForm.General>
          <InputForm.General
            label="Discord通知"
            help={
              <>
                DiscordのWebhook
                URLを登録していると、選択した通知を指定のタイミングで受け取ることができます。
              </>
            }
          >
            <div className={styles['webhook-input-wrapper']}>
              <input
                type="text"
                className={styles['webhook-input']}
                placeholder="URL (https://discord.com/api/webhooks/...)"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button
                disabled={webhookUrl.indexOf('https://') != 0}
                onDisabledClick={() =>
                  toast.error('正しいURLを入力してください')
                }
                onClick={async () => {
                  if (!csrfHeader) return;

                  try {
                    await toast.promise(
                      axios.post(
                        '/characters/main/settings/webhook-test',
                        { url: webhookUrl },
                        {
                          headers: csrfHeader,
                        }
                      ),
                      {
                        loading: 'テストメッセージを送信しています',
                        success: 'テストメッセージを送信しました',
                        error: 'テストメッセージの送信中にエラーが発生しました',
                      }
                    );
                  } catch (e) {
                    console.log(e);
                  }
                }}
              >
                テスト
              </Button>
            </div>
            <NoticeSettings
              followed={webhookFollowed}
              replied={webhookReplied}
              subscribe={webhookSubscribe}
              newMember={webhookNewMember}
              mail={webhookMail}
              onFollowedChange={() => setWebhookFollowed(!webhookFollowed)}
              onRepliedChange={() => setWebhookReplied(!webhookReplied)}
              onSubscribeChange={() => setWebhookSubscribe(!webhookSubscribe)}
              onNewMemberChange={() => setWebhookNewMember(!webhookNewMember)}
              onMailChange={() => setWebhookMail(!webhookMail)}
            />
          </InputForm.General>
          <InputForm.General label="キャラクター削除">
            キャラクター削除は
            <InlineLink href="/settings/character-delete">こちら</InlineLink>
            より行えます。
          </InputForm.General>
          <InputForm.Button>更新</InputForm.Button>
        </InputForm>
      </SectionWrapper>
      <ConfirmModal
        isOpen={isEmailUnregisterConfirmModalOpen}
        onClose={() => setIsEmailUnregisterConfirmModalOpen(false)}
        onCancel={() => setIsEmailUnregisterConfirmModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader) return;

          try {
            await toast.promise(
              axios.post('/characters/main/settings/email/unregister', null, {
                headers: csrfHeader,
              }),
              {
                loading: 'Eメール情報を削除しています',
                success: 'Eメール情報を削除しました',
                error: 'Eメール情報の削除中にエラーが発生しました',
              }
            );

            setOtherSettingsStates({
              ...otherSettingsStates,
              email: null,
            });
            setEmailInput('');
            setIsEmailUnregisterConfirmModalOpen(false);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        本当にメールアドレスの登録を解除しますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={unlinkTarget != null}
        onClose={() => setUnlinkTarget(null)}
        onCancel={() => setUnlinkTarget(null)}
        onOk={async () => {
          if (!csrfHeader) return;
          if (!unlinkTarget) return;

          let url = '';
          switch (unlinkTarget) {
            case 'Google':
              url = '/oauth/google/unlink';
              break;
            case 'Twitter':
              url = '/oauth/twitter/unlink';
              break;
          }

          try {
            await toast.promise(
              axios.post(url, null, {
                headers: csrfHeader,
              }),
              {
                loading: unlinkTarget + 'との提携を解除しています',
                success: unlinkTarget + 'との提携を解除しました',
                error: '提携解除処理中にエラーが発生しました',
              }
            );

            switch (unlinkTarget) {
              case 'Google':
                setOtherSettingsStates({
                  ...otherSettingsStates,
                  linkedStates: {
                    ...otherSettingsStates.linkedStates,
                    google: false,
                  },
                });
                break;
              case 'Twitter':
                setOtherSettingsStates({
                  ...otherSettingsStates,
                  linkedStates: {
                    ...otherSettingsStates.linkedStates,
                    twitter: false,
                  },
                });
                break;
            }
            setUnlinkTarget(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        本当に{unlinkTarget}との提携を解除しますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default SettingsGeneral;
