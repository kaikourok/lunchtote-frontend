import { mdiCancel, mdiCheck, mdiMinus } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import HelpButton from '@/components/molecules/Help/Help';
import Annotations from '@/components/organisms/Annotations/Annotations';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/role/[role].module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import roomIdText from 'lib/roomIdText';
import axios from 'plugins/axios';

type Role = {
  id: number;
  prioriry: number;
  name: string;
  write: boolean | null;
  ban: boolean | null;
  invite: boolean | null;
  useReply: boolean | null;
  useSecret: boolean | null;
  deleteOtherMessage: boolean | null;
  createChildrenRoom: boolean | null;
  color: string | null;
  type: RoleType;
  members: CharacterOverview[];
};

type Response = {
  title: string;
  roles: Role[];
};

const RoleToggle = (props: {
  children: ReactNode;
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  nullProhibitedReason?: string;
  ngProhibitedReason?: string;
}) => {
  return (
    <div className={styles['toggle-wrapper']}>
      <div className={styles['toggle']}>
        <div className={styles['toggle-label']}>{props.label}</div>
        <div className={styles['toggle-boxes']}>
          <div
            className={classNames(styles['toggle-box'], styles['ok'], {
              [styles['checked']]: props.value === true,
            })}
            onClick={() => props.onChange(true)}
          >
            <Icon className={styles['toggle-icon']} path={mdiCheck} />
          </div>
          <div
            className={classNames(
              styles['toggle-box'],
              styles['inherit'],
              {
                [styles['disabled']]: !!props.nullProhibitedReason,
              },
              {
                [styles['checked']]: props.value === null,
              }
            )}
            onClick={() => {
              if (
                typeof props.nullProhibitedReason === 'string' &&
                props.nullProhibitedReason.length
              ) {
                toast.error(props.nullProhibitedReason);
              } else {
                props.onChange(null);
              }
            }}
          >
            <Icon className={styles['toggle-icon']} path={mdiMinus} />
          </div>
          <div
            className={classNames(styles['toggle-box'], styles['ng'], {
              [styles['checked']]: props.value === false,
            })}
            onClick={() => props.onChange(false)}
          >
            <Icon className={styles['toggle-icon']} path={mdiCancel} />
          </div>
        </div>
      </div>
      <div className={styles['toggle-description']}>{props.children}</div>
    </div>
  );
};

const RoomsControlRole: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [name, setName] = useState<string>('');
  const [write, setWrite] = useState<boolean | null>(null);
  const [ban, setBan] = useState<boolean | null>(null);
  const [invite, setInvite] = useState<boolean | null>(null);
  const [useReply, setUseReply] = useState<boolean | null>(null);
  const [useSecret, setUseSecret] = useState<boolean | null>(null);
  const [deleteOtherMessage, setDeleteOtherMessage] = useState<boolean | null>(
    null
  );
  const [createChildrenRoom, setCreateChildrenRoom] = useState<boolean | null>(
    null
  );
  const [permissionNullable, setPermissionNullable] = useState(false);

  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      if (router.isReady) {
        try {
          const response = await axios.get<Response>(
            `/rooms/${router.query.id}/control/role`
          );

          setTitle(response.data.title);

          const filteredRoles = response.data.roles.filter(
            (role) => Number(router.query.role) == role.id
          );
          if (filteredRoles.length != 1) {
            throw new Error('??????ID??????????????????????????????');
          }

          const role = filteredRoles[0];
          setName(role.name);
          setWrite(role.write);
          setBan(role.ban);
          setInvite(role.invite);
          setUseReply(role.useReply);
          setUseSecret(role.useSecret);
          setDeleteOtherMessage(role.deleteOtherMessage);
          setCreateChildrenRoom(role.createChildrenRoom);
          setPermissionNullable(role.type == 'MEMBER');
        } catch (e) {
          console.log(e);
          setError(true);
        } finally {
          setIsFetched(true);
        }
      }
    })();
  }, [router.isReady]);

  if (!isFetched || !router.isReady) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  if (error) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection noMargin>
          ?????????????????????????????????????????????
        </CommentarySection>
      </SubmenuPage>
    );
  }

  return (
    <SubmenuPage
      title={`???????????? | ${roomIdText(Number(router.query.id))} ${title}${
        name ? ' | ' : ''
      }${name}`}
      menu={roomControlsSubmenu(Number(router.query.id))}
    >
      <CommentarySection>
        <p>
          ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <Annotations>
          <Annotations.Item>
            ???????????????????????????????????????????????????????????????
          </Annotations.Item>
        </Annotations>
      </CommentarySection>
      <InputForm
        onSubmit={async (e) => {
          e.preventDefault();
          if (!csrfHeader) return;

          try {
            await toast.promise(
              axios.post(
                `/rooms/${router.query.id}/control/role/${router.query.role}/update`,
                {
                  name,
                  write,
                  ban,
                  invite,
                  useReply,
                  useSecret,
                  deleteOtherMessage,
                  createChildrenRoom,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '??????????????????????????????',
                success: '???????????????????????????',
                error: '???????????????????????????????????????????????????',
              }
            );
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <InputForm.Text
          label="?????????"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputForm.General label="??????">
          <RoleToggle
            value={write}
            onChange={setWrite}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="??????"
          >
            ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
          </RoleToggle>
          <RoleToggle
            value={useReply}
            onChange={setUseReply}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="??????"
          >
            ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
          </RoleToggle>
          <RoleToggle
            value={useSecret}
            onChange={setUseSecret}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="??????"
          >
            ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
          </RoleToggle>
          <RoleToggle
            value={invite}
            onChange={setInvite}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="??????"
          >
            ???????????????????????????????????????????????????????????????????????????????????????????????????
          </RoleToggle>
          <RoleToggle
            value={ban}
            onChange={setBan}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="BAN"
          >
            ???????????????????????????????????????????????????BAN???BAN???????????????????????????
          </RoleToggle>
          <RoleToggle
            value={deleteOtherMessage}
            onChange={setDeleteOtherMessage}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="????????????????????????????????????"
          >
            ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
            <br />
            ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
          </RoleToggle>
          <RoleToggle
            value={createChildrenRoom}
            onChange={setCreateChildrenRoom}
            nullProhibitedReason={
              permissionNullable
                ? undefined
                : '????????????????????????????????????????????????????????????'
            }
            label="????????????????????????"
          >
            ?????????????????????????????????????????????????????????????????????
          </RoleToggle>
        </InputForm.General>
        <InputForm.Button>???????????????</InputForm.Button>
      </InputForm>
    </SubmenuPage>
  );
};

export default RoomsControlRole;
