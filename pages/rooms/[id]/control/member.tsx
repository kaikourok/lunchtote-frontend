import { mdiCheck, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Modal from '@/components/molecules/Modal/Modal';
import Loading from '@/components/organisms/Loading/Loading';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/member.module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import roleName from 'lib/roleName';
import axios from 'plugins/axios';

type RoleOverview = {
  id: number;
  name: string;
  type: RoleType;
};

const MemberRole = (props: { role: RoleOverview }) => {
  return (
    <div className={styles['role']}>
      <div className={styles['role-name']}>
        {roleName(props.role.name, props.role.type)}
      </div>
    </div>
  );
};

const MembersControl: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  useRequireAuthenticated();

  const { data: rolesData, error: rolesError } = useSWR<{
    roles: Role[];
  }>(!router.isReady ? null : `/rooms/${router.query.id}/control/role`);

  const {
    data: members,
    error: membersError,
    mutate,
  } = useSWR<
    {
      id: number;
      name: string;
      mainicon: string;
      roles: RoleOverview[];
    }[]
  >(!router.isReady ? null : `/rooms/${router.query.id}/control/members`);

  const [roleEditTarget, setRoleEditTarget] = useState<number | null>(null);
  const [banTarget, setBanTarget] = useState<number | null>(null);

  if (membersError || rolesError) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </SubmenuPage>
    );
  }

  if (!rolesData || !members) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  const roleEditTargetMember = members.filter(
    (member) => member.id == roleEditTarget
  ).length
    ? members.filter((member) => member.id == roleEditTarget)[0]
    : null;

  const banTargetMember = members.filter((member) => member.id == banTarget)
    .length
    ? members.filter((member) => member.id == banTarget)[0]
    : null;

  return (
    <SubmenuPage
      title={'メンバー管理'}
      menu={roomControlsSubmenu(Number(router.query.id))}
    >
      <section className={styles['members']}>
        {members.map((member) => {
          return (
            <div className={styles['member']} key={member.id}>
              <div className={styles['member-icon-wrapper']}>
                <CharacterIcon url={member.mainicon} />
              </div>
              <div className={styles['member-data']}>
                <div className={styles['member-heading']}>
                  <Link
                    href={{
                      pathname: '/characters/[id]',
                      query: {
                        id: member.id,
                      },
                    }}
                  >
                    <a className={styles['character-link']}>
                      <span className={styles['character-name']}>
                        {member.name}
                      </span>
                      <span className={styles['character-id']}>
                        {characterIdText(member.id)}
                      </span>
                    </a>
                  </Link>
                  {!member.roles.filter((role) => role.type == 'MASTER')
                    .length && (
                    <div
                      className={styles['ban-button']}
                      onClick={() => setBanTarget(member.id)}
                    >
                      BANする
                    </div>
                  )}
                </div>
                <div className={styles['member-roles']}>
                  <>
                    {member.roles.map((role) => (
                      <MemberRole key={role.id} role={role} />
                    ))}
                  </>
                  <div
                    className={styles['add-role-button']}
                    onClick={() => setRoleEditTarget(member.id)}
                  >
                    <Icon path={mdiPencil} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
      <Modal
        heading="付与権限の編集"
        isOpen={roleEditTarget != null}
        onClose={() => setRoleEditTarget(null)}
      >
        {roleEditTargetMember &&
          (!rolesData.roles.filter((role) => role.type == 'MEMBER').length ? (
            <>権限がまだ作成されていません</>
          ) : (
            <div className={styles['edit-roles']}>
              {rolesData.roles
                .filter((role) => role.type == 'MEMBER')
                .map((role) => {
                  const roleApplied = !!roleEditTargetMember.roles.filter(
                    (memberRole) => memberRole.id == role.id
                  ).length;

                  return (
                    <div
                      key={role.id}
                      className={styles['edit-role']}
                      onClick={async () => {
                        if (!csrfHeader) return;

                        if (roleApplied) {
                          try {
                            await axios.post(
                              `/rooms/${router.query.id}/control/revoke-role`,
                              {
                                target: roleEditTarget,
                                role: role.id,
                              },
                              {
                                headers: csrfHeader,
                              }
                            );

                            mutate(
                              members.map((member) => {
                                if (member.id != roleEditTarget) {
                                  return member;
                                } else {
                                  return {
                                    ...member,
                                    roles: [
                                      ...member.roles.filter(
                                        (oldRole) => oldRole.id != role.id
                                      ),
                                    ],
                                  };
                                }
                              }),
                              false
                            );
                          } catch (e) {
                            console.log(e);
                          }
                        } else {
                          try {
                            await axios.post(
                              `/rooms/${router.query.id}/control/grant-role`,
                              {
                                target: roleEditTarget,
                                role: role.id,
                              },
                              {
                                headers: csrfHeader,
                              }
                            );

                            mutate(
                              members.map((member) => {
                                if (member.id != roleEditTarget) {
                                  return member;
                                } else {
                                  return {
                                    ...member,
                                    roles: [
                                      ...member.roles.filter(
                                        (oldRole) => oldRole.id != role.id
                                      ),
                                      {
                                        id: role.id,
                                        name: role.name,
                                        type: role.type,
                                      },
                                    ],
                                  };
                                }
                              }),
                              false
                            );
                          } catch (e) {
                            console.log(e);
                          }
                        }
                      }}
                    >
                      <div
                        className={classnames(styles['edit-role-icon'], {
                          [styles['applied']]: roleApplied,
                        })}
                      >
                        <Icon path={roleApplied ? mdiCheck : mdiPlus} />
                      </div>
                      <div className={styles['edit-role-name']}>
                        {role.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
      </Modal>
      <ConfirmModal
        isOpen={banTargetMember != null}
        onClose={() => setBanTarget(null)}
        onOk={async () => {
          if (!csrfHeader || !banTargetMember) return;

          const targetName = banTargetMember.name;

          await toast.promise(
            axios.post(
              `/rooms/${router.query.id}/control/ban`,
              {
                target: banTarget,
              },
              {
                headers: csrfHeader,
              }
            ),
            {
              loading: `${targetName}をBANしています`,
              success: `${targetName}をBANしました`,
              error: 'BANの処理中にエラーが発生しました',
            }
          );

          mutate(members.filter((member) => member.id != banTarget));
          setBanTarget(null);
        }}
        onCancel={() => setBanTarget(null)}
      >
        {banTargetMember != null && (
          <>本当に{banTargetMember.name}をBANしますか？</>
        )}
      </ConfirmModal>
    </SubmenuPage>
  );
};

export default MembersControl;
