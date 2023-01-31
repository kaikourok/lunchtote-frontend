import {
  mdiChevronDown,
  mdiChevronUp,
  mdiCloudDownload,
  mdiCloudUpload,
  mdiCrop,
  mdiDelete,
  mdiDeleteOff,
  mdiImagePlus,
  mdiLayersPlus,
  mdiPencil,
  mdiCloudOffOutline,
  mdiAlert,
} from '@mdi/js';
import Icon from '@mdi/react';
import axiosBase from 'axios';
import classnames from 'classnames';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { CSSProperties, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import FileInputButton from '@/components/atoms/FileInputButton/FileInputButton';
import SelectOption from '@/components/atoms/SelectOption/SelectOption';
import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Annotations from '@/components/organisms/Annotations/Annotations';
import CropperModal from '@/components/organisms/CropperModal/CropperModal';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/settings/make-icons/[group].module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import replaceArrayPosition from 'lib/replaceArrayPosition';
import rotateCoodinates from 'lib/rotateCoodinates';
import toRadian from 'lib/toRadian';
import axios from 'plugins/axios';

const previewSize = 60;
const croppingSize = 120;

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type ProcessSchema = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

type SavedProcessSchema = ProcessSchema & {
  id: number;
  name: string;
};

type LayerItem = {
  id: number;
  path: string;
};

type LayerGroup = {
  id: number;
  name: string;
  items: LayerItem[];
};

type LayeringGroup = {
  id: number;
  name: string;
  layers: LayerGroup[];
  processes: SavedProcessSchema[];
};

type LayerItemLayerGroups = LayerItem & {
  enabled: boolean;
  isDeleteTarget: boolean;
};

type LayerGroups = {
  id: number;
  name: string;
  items: LayerItemLayerGroups[];
  initialIndex: number;
};

const createNewCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (context == null) {
    throw Error('コンテキストの取得に失敗しました');
  }

  return { canvas, context };
};

const drawLayeredCanvas = async (items: LayerItem[]) => {
  const loadedImages = await Promise.all(
    items.map((item) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.crossOrigin = 'Anonymous';
        image.src = uploaderPath + item.path;
      });
    })
  );

  let maxWidth = 1;
  let maxHeight = 1;
  loadedImages.forEach((image) => {
    if (maxWidth < image.width) maxWidth = image.width;
    if (maxHeight < image.height) maxHeight = image.height;
  });

  const { canvas, context } = createNewCanvas(maxWidth, maxHeight);

  let containsDifferentSize = false;
  loadedImages.forEach((image) => {
    if (image.width != maxWidth || image.height != maxHeight) {
      containsDifferentSize = true;
    }
    context.drawImage(image, 0, 0, maxWidth, maxHeight);
  });

  return { canvas, context, containsDifferentSize };
};

const SettingsMakeIconsGroup: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  const [data, setData] = useState<LayeringGroup>();
  const [error, setError] = useState(false);

  const [layerGroups, setLayerGroups] = useState<LayerGroups[]>([]);
  const [savedProcesses, setSavedProcesses] = useState<SavedProcessSchema[]>(
    []
  );

  const [process, setProcess] = useState<ProcessSchema | null>(null);
  const [isCropperModalOpen, setIsCropperModalOpen] = useState(false);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isApplyDeleteItemModalOpen, setIsApplyDeleteItemModalOpen] =
    useState(false);

  const [renameLayer, setRenameLayer] = useState('');
  const [renameLayerIndex, setRenameLayerIndex] = useState<number | null>(null);

  const [newProcessSchemaName, setNewProcessSchemaName] = useState('');
  const [isNewProcessSchemaModalOpen, setIsNewProcessSchemaModalOpen] =
    useState(false);

  const [newLayerGroupName, setNewLayerGroupName] = useState('');
  const [isNewLayerGroupModalOpen, setIsNewLayerGroupModalOpen] =
    useState(false);

  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(
    null
  );

  const [selectProcessIndex, setSelectProcessIndex] = useState<number | null>(
    null
  );
  const [isSelectProcessModalOpen, setIsSelectProcessModalOpen] =
    useState(false);

  const [deleteProcessIndex, setDeleteProcessIndex] = useState<number | null>(
    null
  );
  const [isDeleteProcessModalOpen, setIsDeleteProcessModalOpen] =
    useState(false);

  const [deleteLayerIndex, setDeleteLayerIndex] = useState<number | null>(null);

  const [layeredIconDataUrl, setLayeredIconDataUrl] = useState('');
  const [layeredIconDataSize, setLayeredIconDataSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [containsDifferentSize, setContainsDifferentSize] = useState(false);
  const [isTooFewSize, setIsTooFewSize] = useState(false);
  const [changesAspectRadio, setChangesAspectRadio] = useState(false);

  const updateWarning = (
    iconSize: {
      width: number;
      height: number;
    } | null
  ) => {
    let isTooFewSize = false;
    let changesAspectRadio = false;

    if (process) {
      if (croppingSize / previewSize < process.scale / 100) {
        isTooFewSize = true;
      }
    } else {
      if (iconSize && iconSize.width != iconSize.height) {
        changesAspectRadio = true;
      }
    }

    setIsTooFewSize(isTooFewSize);
    setChangesAspectRadio(changesAspectRadio);
  };

  const toggleSelection = (layerGroupIndex: number, layerItemIndex: number) => {
    const newData = layerGroups.map((layerGroup, i) => ({
      ...layerGroup,
      items: layerGroup.items.map((item, j) => {
        if (layerGroupIndex == i && layerItemIndex == j) {
          return {
            ...item,
            enabled: !item.enabled,
          };
        } else {
          return item;
        }
      }),
    }));

    setLayerGroups(newData);
  };

  const toggleDeleteSelection = (
    layerGroupIndex: number,
    layerItemIndex: number
  ) => {
    const newData = layerGroups.map((layerGroup, i) => ({
      ...layerGroup,
      items: layerGroup.items.map((item, j) => {
        if (layerGroupIndex == i && layerItemIndex == j) {
          return {
            ...item,
            isDeleteTarget: !item.isDeleteTarget,
          };
        } else {
          return item;
        }
      }),
    }));

    setLayerGroups(newData);
  };

  const getEnabledLayerItems = () => {
    const items: LayerItem[] = [];

    layerGroups.forEach((layerGroup) => {
      const layerGroupItems: LayerItem[] = [];

      layerGroup.items.forEach((item) => {
        if (item.enabled) {
          layerGroupItems.push({
            id: item.id,
            path: item.path,
          });
        }
      });

      items.unshift(...layerGroupItems);
    });

    return items;
  };

  const createIcon = async () => {
    if (!csrfHeader) return;

    const { canvas, context } = await drawLayeredCanvas(getEnabledLayerItems());
    let resultCanvas: HTMLCanvasElement;
    let resultContext: CanvasRenderingContext2D;

    if (!process) {
      resultCanvas = canvas;
      resultContext = context;
    } else {
      const rad = toRadian(process.rotate);
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);

      // 単純に回転させてしまうと角周辺のピクセルが遺失するため適切な量パディング
      // 各画像角の回転後座標を求め、そこから必要な範囲を導出する
      // （本当はちゃんと回転後サイズを立式したほうが計算量的に最適なんだけど面倒だったのでこのアルゴリズム）
      const ranges = [
        {
          x: canvas.width / 2,
          y: canvas.height / 2,
        },
        {
          x: -canvas.width / 2,
          y: canvas.height / 2,
        },
        {
          x: canvas.width / 2,
          y: -canvas.height / 2,
        },
        {
          x: -canvas.width / 2,
          y: -canvas.height / 2,
        },
      ]
        .map((coodinates) =>
          rotateCoodinates(coodinates.x, coodinates.y, {
            rad,
            sin,
            cos,
          })
        )
        .reduce(
          (acc, coodinates) => {
            return {
              minX: coodinates.x < acc.minX ? coodinates.x : acc.minX,
              minY: coodinates.y < acc.minY ? coodinates.y : acc.minY,
              maxX: coodinates.x > acc.maxX ? coodinates.x : acc.maxX,
              maxY: coodinates.y > acc.maxY ? coodinates.y : acc.maxY,
            };
          },
          { minX: 0, minY: 0, maxX: 0, maxY: 0 }
        );

      // 各方向の長さに+4することで端1pxの小数点以下の遺失を防ぐ
      const lengths = {
        width: Math.floor(Math.abs(ranges.minX) + Math.abs(ranges.maxX) + 4),
        height: Math.floor(Math.abs(ranges.minY) + Math.abs(ranges.maxY) + 4),
      };

      const { canvas: processCanvas, context: processContext } =
        createNewCanvas(lengths.width, lengths.height);

      processContext.translate(lengths.width / 2, lengths.height / 2);
      processContext.rotate(toRadian(process.rotate));
      processContext.drawImage(
        canvas,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      const resultSize = croppingSize / (process.scale / 100);

      ({ canvas: resultCanvas, context: resultContext } = createNewCanvas(
        resultSize,
        resultSize
      ));

      const { x: dx, y: dy } = rotateCoodinates(process.x, process.y, {
        rad,
        sin,
        cos,
      });

      resultContext.drawImage(
        processCanvas,
        processCanvas.width / 2 - resultSize / 2 - dx / (process.scale / 100),
        processCanvas.height / 2 - resultSize / 2 - dy / (process.scale / 100),
        resultSize,
        resultSize,
        0,
        0,
        resultSize,
        resultSize
      );
    }

    let uploadedPath = '';
    try {
      const response = await axios.post<{ paths: string[] }>(
        '/characters/main/upload/base64?type=icon',
        {
          images: [resultCanvas.toDataURL('image/png')],
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...csrfHeader,
          },
        }
      );

      uploadedPath = response.data.paths[0];
    } catch (e) {
      if (axiosBase.isAxiosError(e) && e.response) {
        const statusCode: number = e.response.status;

        switch (statusCode) {
          case 413:
            toast.error('アップロード容量が大きすぎます');
            break;
        }
      }

      console.log(e);
      return;
    }

    try {
      await axios.post(
        '/characters/main/settings/icons',
        {
          icons: [
            {
              path: uploadedPath,
            },
          ],
          insertOnly: true,
        },
        {
          headers: csrfHeader,
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  const calcPreviewStyle = (isPreview?: boolean): CSSProperties => {
    if (process) {
      const viewRate = previewSize / croppingSize;

      return {
        transform: `rotate(${process.rotate}deg) translate(${
          process.x * viewRate
        }px, ${process.y * viewRate}px) scale(${
          (process.scale * viewRate) / 100
        })`,
      };
    } else {
      if (isPreview) {
        return {
          width: '100%',
          height: '100%',
        };
      } else {
        return {
          maxWidth: '100%',
          maxHeight: '100%',
        };
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { canvas, containsDifferentSize } = await drawLayeredCanvas(
        getEnabledLayerItems()
      );

      const size = {
        width: canvas.width,
        height: canvas.height,
      };

      setLayeredIconDataUrl(canvas.toDataURL());
      setContainsDifferentSize(containsDifferentSize);
      setLayeredIconDataSize(size);
      updateWarning(size);
    })();
  }, [layerGroups]);

  useEffect(() => {
    updateWarning(layeredIconDataSize);
  }, [process]);

  useEffect(() => {
    if (router.isReady) {
      (async () => {
        try {
          const result = await axios.get<LayeringGroup>(
            `/characters/main/settings/layerings/${router.query.group}`
          );

          setData(result.data);
          setLayerGroups(
            result.data.layers.map((layerGroup, i) => ({
              ...layerGroup,
              items: layerGroup.items.map((item, j) => ({
                ...item,
                isDeleteTarget: false,
                enabled: j == 0,
              })),
              initialIndex: i,
            }))
          );
          setSavedProcesses(result.data.processes);
        } catch (e) {
          console.log(e);
          setError(true);
        }
      })();
    }
  }, [router.isReady]);

  if (error) {
    return (
      <DefaultPage>
        <PageData title="アイコンレイヤリング" />
        <Heading>アイコンレイヤリング</Heading>
        <CommentarySection>
          ページの読み込み中にエラーが発生しました。
        </CommentarySection>
      </DefaultPage>
    );
  }

  if (!isAuthenticated || !isAuthenticationTried || !data) {
    return (
      <DefaultPage>
        <PageData title="アイコンレイヤリング" />
        <Heading>アイコンレイヤリング</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const isDeleteExectable =
    isDeleteMode &&
    layerGroups.reduce(
      (acc, layer) =>
        acc ||
        !!layer.items.filter((item) => item.isDeleteTarget == true).length,
      false
    );

  const applyLayerOrderExectable = !!layerGroups.filter(
    (layer, index) => layer.initialIndex != index
  ).length;

  const tooFewSizeWarning = isTooFewSize
    ? '出力される画像サイズが表示サイズより小さくなっています。'
    : null;

  const differentSizeWarning = containsDifferentSize
    ? '解像度の異なる画像が混入しています。正しく画像が処理できない可能性があります。'
    : null;

  const changesAspectRadioWarning = changesAspectRadio
    ? 'アスペクト比の変更が行われています。'
    : null;

  const warning =
    tooFewSizeWarning || differentSizeWarning || changesAspectRadioWarning;

  return (
    <DefaultPage>
      <PageData title={`アイコンレイヤリング | ${data.name}`} />
      <Heading>アイコンレイヤリング | {data.name}</Heading>
      <CommentarySection>
        <p>
          各レイヤーから画像を選択し、新たなアイコンを作成します。レイヤーアイテムを削除する場合、
          <b>レイヤーアイテム削除</b>
          からアイテム削除モードを有効にし、削除したいアイテムを選択してからアイテム削除を実行を押すことで削除できます。
        </p>
        <Annotations>
          <Annotations.Item>
            プレビューは簡易表示のため、実際の表示と多少差異がある場合があります。
          </Annotations.Item>
          <Annotations.Item>
            解像度の異なる画像が混入している場合、正しく処理できない場合があります。
          </Annotations.Item>
        </Annotations>
      </CommentarySection>
      <section className={styles['action-groups']}>
        <section className={styles['actions']}>
          <Button
            icon={mdiLayersPlus}
            className={styles['action']}
            onClick={() => setIsNewLayerGroupModalOpen(true)}
          >
            レイヤーの追加
          </Button>
          <Button
            icon={mdiLayersPlus}
            className={styles['action']}
            onClick={async () => {
              if (!csrfHeader) return;

              try {
                await toast.promise(
                  axios.post(
                    `/characters/main/settings/layerings/${router.query.group}/layer-orders`,
                    {
                      orders: layerGroups.map((layer, index) => ({
                        layerGroup: layer.id,
                        order: layerGroups.length - 1 - index, // 逆順で保存
                      })),
                    },
                    {
                      headers: {
                        ...csrfHeader,
                      },
                    }
                  ),
                  {
                    loading: 'レイヤー順の変更を保存しています',
                    success: 'レイヤー順の変更を保存しました',
                    error: 'レイヤー順の変更中にエラーが発生しました',
                  }
                );

                setLayerGroups(
                  layerGroups.map((layer, index) => {
                    return {
                      ...layer,
                      initialIndex: index,
                    };
                  })
                );
              } catch (e) {
                console.log(e);
              }
            }}
            onDisabledClick={() => {
              toast.error('レイヤー順は変更されていません');
            }}
            disabled={!applyLayerOrderExectable}
            highlight={applyLayerOrderExectable}
          >
            レイヤー順変更保存
          </Button>
          {isDeleteMode ? (
            <>
              <Button
                icon={mdiDeleteOff}
                className={styles['action']}
                onClick={() => setIsDeleteMode(false)}
              >
                削除キャンセル
              </Button>
              <Button
                icon={mdiDelete}
                className={styles['action']}
                disabled={!isDeleteExectable}
                highlight={isDeleteExectable}
                onClick={() => setIsApplyDeleteItemModalOpen(true)}
                onDisabledClick={() => {
                  toast.error('削除するアイテムが選択されていません');
                }}
              >
                削除実行
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={mdiDelete}
                className={styles['action']}
                onClick={() => setIsDeleteMode(true)}
              >
                レイヤーアイテム削除
              </Button>
            </>
          )}
        </section>
        <section className={styles['actions']}>
          <Button
            icon={mdiCrop}
            className={styles['action']}
            onClick={() => setIsCropperModalOpen(true)}
          >
            トリミング設定
          </Button>
          <Button
            icon={mdiCloudUpload}
            className={styles['action']}
            onClick={() => setIsNewProcessSchemaModalOpen(true)}
            disabled={process == null}
            onDisabledClick={() =>
              toast.error('トリミング設定を行っていません')
            }
          >
            トリミング設定保存
          </Button>
          <Button
            icon={mdiCloudDownload}
            className={styles['action']}
            onClick={() => setIsSelectProcessModalOpen(true)}
            disabled={!savedProcesses.length}
            onDisabledClick={() =>
              toast.error('保存されたトリミング設定がありません')
            }
          >
            トリミング設定読込
          </Button>
          <Button
            icon={mdiCloudOffOutline}
            className={styles['action']}
            onClick={() => setIsDeleteProcessModalOpen(true)}
            disabled={!savedProcesses.length}
            onDisabledClick={() =>
              toast.error('保存されたトリミング設定がありません')
            }
          >
            トリミング設定削除
          </Button>
        </section>
      </section>
      <section className={styles['preview']}>
        <div className={styles['preview-heading']}>プレビュー</div>
        <div className={styles['preview-content']}>
          <div className={styles['preview-image-wrapper']}>
            <img
              style={calcPreviewStyle(true)}
              className={styles['preview-image']}
              src={layeredIconDataUrl}
            />
          </div>
          <Button
            onClick={async () => {
              await toast.promise(createIcon(), {
                loading: 'アイコンを作成しています',
                success: 'アイコンを作成しました',
                error: 'アイコンの作成中にエラーが発生しました',
              });
            }}
            disabled={getEnabledLayerItems().length == 0}
            onDisabledClick={() => {
              toast.error('レイヤーアイテムが選択されていません');
            }}
          >
            アイコン作成
          </Button>
          {!!warning && (
            <div className={styles['warning-wrapper']}>
              <div className={styles['warning-icon']}>
                <Icon path={mdiAlert} />
              </div>
              <div className={styles['warning-content']}>{warning}</div>
            </div>
          )}
        </div>
      </section>
      <section className={styles['layer-groups']}>
        {layerGroups.map((layerGroup, i) => {
          return (
            <section key={i} className={styles['layer-group']}>
              <section className={styles['layer-group-heading']}>
                <div className={styles['layer-group-name']}>
                  {layerGroup.name}
                  <div
                    className={styles['inline-layer-group-action']}
                    onClick={() => {
                      setRenameLayer(layerGroup.name);
                      setRenameLayerIndex(i);
                    }}
                  >
                    <Icon path={mdiPencil} />
                  </div>
                </div>
                <div className={styles['layer-group-actions']}>
                  <div
                    className={classnames(styles['layer-group-action'], {
                      [styles['hidden']]: i == 0,
                    })}
                    onClick={() => {
                      setLayerGroups(
                        replaceArrayPosition(layerGroups, i, i - 1)
                      );
                    }}
                  >
                    <Icon path={mdiChevronUp} />
                  </div>
                  <div
                    className={classnames(styles['layer-group-action'], {
                      [styles['hidden']]: i == layerGroups.length - 1,
                    })}
                    onClick={() => {
                      setLayerGroups(
                        replaceArrayPosition(layerGroups, i, i + 1)
                      );
                    }}
                  >
                    <Icon path={mdiChevronDown} />
                  </div>
                  <div
                    className={classnames(
                      styles['layer-group-action'],
                      styles['small-icon']
                    )}
                    onClick={() => setUploadTargetIndex(i)}
                  >
                    <Icon path={mdiImagePlus} />
                  </div>
                  <div
                    className={classnames(
                      styles['layer-group-action'],
                      styles['small-icon']
                    )}
                    onClick={() => setDeleteLayerIndex(i)}
                  >
                    <Icon path={mdiDelete} />
                  </div>
                </div>
              </section>
              <section className={styles['layer-items']}>
                {layerGroup.items.map((layerItem, j) => {
                  return (
                    <div
                      key={j}
                      className={classnames(styles['layer-item-wrapper'], {
                        [styles['enabled']]: !isDeleteMode && layerItem.enabled,
                        [styles['delete-target']]:
                          isDeleteMode && layerItem.isDeleteTarget,
                      })}
                      onClick={() => {
                        if (isDeleteMode) {
                          toggleDeleteSelection(i, j);
                        } else {
                          toggleSelection(i, j);
                        }
                      }}
                    >
                      <img
                        style={calcPreviewStyle()}
                        src={uploaderPath + layerItem.path}
                        className={styles['layer-item']}
                      />
                    </div>
                  );
                })}
              </section>
            </section>
          );
        })}
      </section>
      <ConfirmModal
        heading="レイヤーアイテムの削除"
        isOpen={isApplyDeleteItemModalOpen}
        onClose={() => setIsApplyDeleteItemModalOpen(false)}
        onCancel={() => setIsApplyDeleteItemModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader) {
            return;
          }

          setIsApplyDeleteItemModalOpen(false);

          const deleteTarget = layerGroups.reduce<number[]>((acc, layer) => {
            return [
              ...acc,
              ...layer.items
                .filter((item) => item.isDeleteTarget)
                .map((item) => item.id),
            ];
          }, []);

          if (!deleteTarget.length) {
            return;
          }

          try {
            await toast.promise(
              axios.post(
                `/characters/main/settings/layerings/${router.query.group}/delete-items`,
                {
                  target: deleteTarget,
                },
                {
                  headers: {
                    ...csrfHeader,
                  },
                }
              ),
              {
                loading: '選択したアイテムを削除しています',
                success: '選択したアイテムの削除に成功しました',
                error: '選択したアイテムの削除中にエラーが発生しました',
              }
            );

            setLayerGroups(
              layerGroups.map((layer) => {
                return {
                  ...layer,
                  items: layer.items.filter(
                    (item) => !deleteTarget.includes(item.id)
                  ),
                };
              })
            );

            setIsDeleteMode(false);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        選択したアイテムを削除しますか？ この操作は元に戻せません。
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤーアイテムのアップロード"
        isOpen={uploadTargetIndex != null}
        onClose={() => {
          setUploadTargetIndex(null);
          setUploadingFiles([]);
        }}
        onCancel={() => {
          setUploadTargetIndex(null);
          setUploadingFiles([]);
        }}
        onOk={async () => {
          if (
            !csrfHeader ||
            !uploadingFiles.length ||
            uploadTargetIndex == null
          ) {
            return;
          }

          const targetIndex = uploadTargetIndex;
          const files = uploadingFiles;

          setUploadTargetIndex(null);
          setUploadingFiles([]);

          const submitData = new FormData();
          for (let i = 0; i < files.length; i++) {
            submitData.append(`images[]`, files[i]);
          }

          let paths = Array<string>();
          try {
            const { data } = await axios.post<{ paths: string[] }>(
              '/characters/main/upload?type=icon-fragment',
              submitData,
              {
                headers: {
                  'content-type': 'multipart/form-data',
                  ...csrfHeader,
                },
              }
            );
            paths = data.paths;
          } catch (e) {
            if (axiosBase.isAxiosError(e) && e.response) {
              const statusCode: number = e.response.status;

              switch (statusCode) {
                case 413:
                  toast.error('アップロード容量が大きすぎます');
                  break;
                default:
                  toast.error('画像の処理中にエラーが発生しました');
              }
            }

            console.log(e);
            return;
          }

          try {
            const images = layerGroups[targetIndex].items.map((item) => ({
              path: item.path,
            }));

            paths.forEach((path) => {
              images.push({
                path: path,
              });
            });

            const result = await axios.put<LayerItem[]>(
              `/characters/main/settings/layerings/${router.query.group}/layers/${layerGroups[targetIndex].id}/images`,
              {
                images,
              },
              {
                headers: {
                  ...csrfHeader,
                },
              }
            );

            setLayerGroups([
              ...layerGroups.map((data, index) => {
                const items = data.items;

                return {
                  ...data,
                  items:
                    index != targetIndex
                      ? data.items
                      : result.data.map((item) => ({
                          ...item,
                          isDeleteTarget: false,
                          enabled: false,
                        })),
                };
              }),
            ]);
          } catch (e) {}
        }}
        disabled={!uploadingFiles?.length}
      >
        <FileInputButton
          className={styles['button']}
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length) {
              const fileArray: File[] = [];
              Object.keys(e.target.files).map(async (key) => {
                fileArray.push(e.target.files![Number(key)]);
              });
              setUploadingFiles(fileArray);
            } else {
              setUploadingFiles([]);
            }
            e.target.value = '';
          }}
        >
          画像選択
        </FileInputButton>
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤーの追加"
        isOpen={isNewLayerGroupModalOpen}
        onClose={() => setIsNewLayerGroupModalOpen(false)}
        onCancel={() => setIsNewLayerGroupModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader) return;

          setIsNewLayerGroupModalOpen(false);

          try {
            const createLayerGroupName = newLayerGroupName;

            const result = await toast.promise(
              axios.post<{ id: number }>(
                `/characters/main/settings/layerings/${router.query.group}/layers`,
                {
                  name: newLayerGroupName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'レイヤーを作成しています',
                success: 'レイヤーを作成しました',
                error: 'レイヤーの作成中にエラーが発生しました',
              }
            );

            setLayerGroups([
              {
                id: result.data.id,
                name: createLayerGroupName,
                items: [],
                initialIndex: 0,
              },
              ...layerGroups.map((layer) => ({
                ...layer,
                initialIndex: layer.initialIndex + 1,
              })),
            ]);
            setNewLayerGroupName('');
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!newLayerGroupName}
      >
        <div className={styles['new-item-modal-inner']}>
          <div className={styles['new-item-modal-text']}>
            新しいレイヤーの名前を入力してください
          </div>
          <div className={styles['new-item-modal-input-wrapper']}>
            <input
              className={styles['new-item-modal-input']}
              type="text"
              placeholder="レイヤー名"
              onChange={(e) => setNewLayerGroupName(e.target.value)}
              value={newLayerGroupName}
            />
          </div>
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤーの削除"
        isOpen={deleteLayerIndex != null}
        onClose={() => setDeleteLayerIndex(null)}
        onCancel={() => setDeleteLayerIndex(null)}
        onOk={async () => {
          if (!csrfHeader || deleteLayerIndex == null) return;

          try {
            const targetIndex = deleteLayerIndex;
            const targetId = layerGroups[deleteLayerIndex].id;

            setDeleteLayerIndex(null);

            const result = await toast.promise(
              axios.post<{ id: number }>(
                `/characters/main/settings/layerings/${router.query.group}/layers/${targetId}/delete`,
                null,
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'レイヤーを削除しています',
                success: 'レイヤーを削除しました',
                error: 'レイヤーの削除中にエラーが発生しました',
              }
            );

            setLayerGroups([
              ...layerGroups
                .map((layer, index) => {
                  if (index <= targetIndex) {
                    return layer;
                  } else {
                    return {
                      ...layer,
                      initialIndex: layer.initialIndex - 1,
                    };
                  }
                })
                .filter((layerGroup) => layerGroup.id != targetId),
            ]);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {deleteLayerIndex != null && (
          <>
            {layerGroups[deleteLayerIndex].name}を削除しますか？
            この操作は元に戻せません。
          </>
        )}
      </ConfirmModal>
      <ConfirmModal
        heading="トリミング設定の追加"
        isOpen={isNewProcessSchemaModalOpen}
        onClose={() => setIsNewProcessSchemaModalOpen(false)}
        onCancel={() => setIsNewProcessSchemaModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader || !process) return;

          setIsNewProcessSchemaModalOpen(false);

          try {
            const name = newProcessSchemaName;
            const saveProcess = {
              name: name,
              x: process.x,
              y: process.y,
              rotate: process.rotate,
              scale: process.scale,
            };

            const result = await toast.promise(
              axios.post<{ id: number }>(
                `/characters/main/settings/layerings/${router.query.group}/processes`,
                saveProcess,
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'トリミング設定を保存しています',
                success: 'トリミング設定を保存しました',
                error: 'トリミング設定の保存中にエラーが発生しました',
              }
            );

            setSavedProcesses([
              ...savedProcesses,
              {
                ...saveProcess,
                id: result.data.id,
                name,
              },
            ]);
            setNewProcessSchemaName('');
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!newProcessSchemaName}
      >
        <div className={styles['new-item-modal-inner']}>
          <div className={styles['new-item-modal-text']}>
            現在のトリミング設定を保存します。保存するトリミング設定の名前を入力してください。
          </div>
          <div className={styles['new-item-modal-input-wrapper']}>
            <input
              className={styles['new-item-modal-input']}
              type="text"
              placeholder="トリミング設定名"
              onChange={(e) => setNewProcessSchemaName(e.target.value)}
              value={newProcessSchemaName}
            />
          </div>
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="トリミング設定の読み込み"
        isOpen={isSelectProcessModalOpen}
        onClose={() => {
          setIsSelectProcessModalOpen(false);
          setSelectProcessIndex(null);
        }}
        onCancel={() => {
          setIsSelectProcessModalOpen(false);
          setSelectProcessIndex(null);
        }}
        onOk={() => {
          if (selectProcessIndex == null) {
            return;
          }

          const targetProcess = savedProcesses[selectProcessIndex];
          setProcess({
            x: targetProcess.x,
            y: targetProcess.y,
            rotate: targetProcess.rotate,
            scale: targetProcess.scale,
          });
          setIsSelectProcessModalOpen(false);
          setSelectProcessIndex(null);

          toast.success(`${targetProcess.name}を読み込みました`);
        }}
        disabled={selectProcessIndex == null}
      >
        <div className={styles['new-item-modal-inner']}>
          <div className={styles['new-item-modal-text']}>
            読み込むトリミング設定を選択して下さい。
          </div>
          <SelectOption
            options={[
              {
                label: 'トリミング設定を選択',
                value: null,
                isPlaceholder: true,
              },
              ...savedProcesses.map((option, index) => {
                return {
                  label: option.name,
                  value: index,
                };
              }),
            ]}
            value={selectProcessIndex}
            onChange={(index) => {
              setSelectProcessIndex(index);
            }}
          />
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="トリミング設定の削除"
        isOpen={isDeleteProcessModalOpen}
        onClose={() => {
          setIsDeleteProcessModalOpen(false);
          setDeleteProcessIndex(null);
        }}
        onCancel={() => {
          setIsDeleteProcessModalOpen(false);
          setDeleteProcessIndex(null);
        }}
        onOk={async () => {
          if (!csrfHeader || deleteProcessIndex == null) {
            return;
          }

          const targetIndex = deleteProcessIndex;
          setIsDeleteProcessModalOpen(false);
          setDeleteProcessIndex(null);

          try {
            await toast.promise(
              axios.post(
                `/characters/main/settings/layerings/${router.query.group}/processes/${savedProcesses[targetIndex].id}/delete`,
                null,
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'トリミング設定を削除しています',
                success: 'トリミング設定を削除しました',
                error: 'トリミング設定の削除中にエラーが発生しました',
              }
            );

            setSavedProcesses(
              savedProcesses.filter((_, index) => index != targetIndex)
            );
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={deleteProcessIndex == null}
      >
        <div className={styles['new-item-modal-inner']}>
          <div className={styles['new-item-modal-text']}>
            <b>削除する</b>トリミング設定を選択して下さい。
          </div>
          <SelectOption
            options={[
              {
                label: 'トリミング設定を選択',
                value: null,
                isPlaceholder: true,
              },
              ...savedProcesses.map((option, index) => {
                return {
                  label: option.name + 'を削除',
                  value: index,
                };
              }),
            ]}
            value={deleteProcessIndex}
            onChange={(index) => {
              setDeleteProcessIndex(index);
            }}
          />
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤーのリネーム"
        isOpen={renameLayerIndex != null}
        onClose={() => setRenameLayerIndex(null)}
        onCancel={() => setRenameLayerIndex(null)}
        onOk={async () => {
          if (!csrfHeader || renameLayerIndex == null || !renameLayer) return;

          try {
            const name = renameLayer;
            const targetId = layerGroups[renameLayerIndex].id;

            setRenameLayer('');
            setRenameLayerIndex(null);

            await toast.promise(
              axios.put(
                `/characters/main/settings/layerings/${router.query.group}/layers/${targetId}`,
                {
                  name,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'レイヤーをリネームしています',
                success: 'レイヤーをリネームしました',
                error: 'レイヤーのリネーム中にエラーが発生しました',
              }
            );

            setLayerGroups(
              layerGroups.map((layer) => {
                if (layer.id != targetId) {
                  return layer;
                } else {
                  return {
                    ...layer,
                    name,
                  };
                }
              })
            );
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!renameLayer}
      >
        <div className={styles['new-item-modal-inner']}>
          <div className={styles['new-item-modal-text']}>
            レイヤーをリネームします。新しい名前を入力してください。
          </div>
          <div className={styles['new-item-modal-input-wrapper']}>
            <input
              className={styles['new-item-modal-input']}
              type="text"
              placeholder="レイヤー名"
              onChange={(e) => setRenameLayer(e.target.value)}
              value={renameLayer}
            />
          </div>
        </div>
      </ConfirmModal>
      <CropperModal
        isOpen={isCropperModalOpen}
        src={layeredIconDataUrl}
        onApply={(deltaX, deltaY, scale, rotate) => {
          setProcess({
            x: deltaX,
            y: deltaY,
            scale,
            rotate,
          });
          setIsCropperModalOpen(false);
        }}
        onCancel={() => {
          setIsCropperModalOpen(false);
        }}
        onReset={() => {
          setProcess(null);
          setIsCropperModalOpen(false);
        }}
      />
    </DefaultPage>
  );
};

export default SettingsMakeIconsGroup;
