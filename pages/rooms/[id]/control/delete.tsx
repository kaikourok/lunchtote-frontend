import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mdiClose, mdiDragHorizontalVariant } from '@mdi/js';
import Icon from '@mdi/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEventHandler, MouseEventHandler, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/index.module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';

const RoomsControlDelete: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  useRequireAuthenticated();

  const { data, error } = useSWR<{ title: string }>(
    `/rooms/${router.query.id}/control/general`
  );
  const [confirm, setConfirm] = useState('');

  if (error) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </SubmenuPage>
    );
  }

  if (!data) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  return (
    <SubmenuPage
      title="ルーム削除"
      menu={roomControlsSubmenu(Number(router.query.id))}
    >
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();

            if (!csrfHeader) return;

            (async () => {
              try {
                await toast.promise(
                  axios.post(`/rooms/${router.query.id}/control/delete`, null, {
                    headers: csrfHeader,
                  }),
                  {
                    loading: 'ルームを削除しています',
                    success: 'ルームを削除しました',
                    error: 'ルームの削除中にエラーが発生しました',
                  }
                );
              } catch (e) {
                console.log(e);
              }
            })();

            router.push('/home');
          }}
        >
          <InputForm.Text
            label="削除確認"
            placeholder={data.title}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            help={
              <>
                ルームのタイトルを入力してルーム削除ボタンを押すことでルームが削除されます。この操作は取り消せません。
              </>
            }
          />
          <InputForm.Button
            disabled={confirm != data.title}
            onDisabledClick={() => {
              toast.error('タイトルが異なります');
            }}
          >
            ルーム削除
          </InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </SubmenuPage>
  );
};

export default RoomsControlDelete;
