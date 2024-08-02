'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppState } from '@/lib/providers/state-providers';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import 'quill/dist/quill.snow.css';
import { Button } from '../ui/button';
import {
  deleteFile,
  deleteFolder,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Badge } from '../ui/badge';

interface QuillEditorProps {
  dirDetails: File | Folder | workspace;
  fileId: string;
  dirType: 'workspace' | 'folder' | 'file';
}

var TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  fileId,
  dirType,
}) => {
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useSupabaseUser();
  const { socket, isConnected } = useSocket();
  const [quill, setQuill] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === 'file') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === 'folder') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId);
    }
    if (dirType === 'workspace') {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === workspaceId,
      );
    }

    if (selectedDir) {
      return selectedDir;
    }

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as workspace | Folder | File;
  }, [state, workspaceId, folderId]);

  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== undefined) {
      if (wrapper == null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;

      //WIP cursors
      const q = new Quill(editor, {
        theme: 'snow',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          //WIP cursors
        },
      });
      setQuill(q);
    }
  }, []);

  const restoreFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { inTrash: '' }, fileId, folderId, workspaceId },
      });
      await updateFile({ inTrash: '' }, fileId);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { inTrash: '' },
          folderId: fileId,
          workspaceId,
        },
      });
      await updateFolder({ inTrash: '' }, fileId);
    }
  };

  const deleteFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'DELETE_FILE',
        payload: { fileId, folderId, workspaceId },
      });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'DELETE_FOLDER',
        payload: { folderId: fileId, workspaceId },
      });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  useEffect(() => {
    if (!fileId) return;
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === 'file') {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) return router.replace('/dashboard');
        if (!selectedDir[0]) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill == null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { data: selectedDir[0].data },
            fileId,
            folderId: selectedDir[0].folderId,
            workspaceId,
          },
        });
      }
      if (dirType === 'folder') {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`);
        }

        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: fileId,
            folder: { data: selectedDir[0].data },
            workspaceId: selectedDir[0].workspaceId!,
          },
        });
      }
      if (dirType === 'workspace') {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { data: selectedDir[0].data },
            workspaceId: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType]);

  //create rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  //send quill changes to all the clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return;

    // TODO Cursor update
    const selectionChangeHandler = () => {};

    const quillHandler = (delta: any, _: any, source: any) => {
      if (source !== 'user') return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType == 'workspace') {
            dispatch({
              type: 'UPDATE_WORKSPACE',
              payload: {
                workspace: { data: JSON.stringify(contents) },
                workspaceId: fileId,
              },
            });
            await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType == 'folder') {
            if (!workspaceId) return;
            dispatch({
              type: 'UPDATE_FOLDER',
              payload: {
                folder: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: fileId,
              },
            });
            await updateFolder({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType == 'file') {
            if (!workspaceId || !folderId) return;
            dispatch({
              type: 'UPDATE_FILE',
              payload: {
                file: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: folderId,
                fileId,
              },
            });
            await updateFile({ data: JSON.stringify(contents) }, fileId);
          }
        }
        setSaving(false);
      }, 850);
      socket.emit('send-changes', delta, fileId);
    };

    quill.on('text-change', quillHandler);
    //quill.on('selection-change', selectionChangeHandler(user.id));

    return () => {
      quill.off('text-change', quillHandler);
      quill.off('selection-change', selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, user, details]);

  // To listen changes
  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };

    socket.on('receive-changes', socketHandler);

    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  return (
    <>
      <div className="relative">
        {details.inTrash && (
          <article
            className="py-2
            z-40
            bg-[#EB5757]
            flex
            md:flex-row
            flex-col
            justify-center
            items-center
            gap-4
            flex-wrap
            "
          >
            <div
              className="flex
            flex-col
            md:flex
            row gap-2
            justify-center
            items-center"
            >
              <span className="text-white">This {dirType} is in the trash</span>
              <Button
                size={'sm'}
                variant={'outline'}
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                size={'sm'}
                variant={'outline'}
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}
      </div>
      <div
        className="flex 
        flex-col-reverse 
        sm:flex-row 
        sm:justify-between 
        justify-center 
        sm:items-center 
        sm:p-2 
        p-8"
      >
        {saving ? (
          <Badge
            variant="secondary"
            className="bg-orange-600 top-4
                text-white
                right-4
                z-50
                "
          >
            Saving...
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-emerald-600 
                top-4
              text-white
              right-4
              z-50
              "
          >
            Saved
          </Badge>
        )}
      </div>
      <div
        className="flex
      justify-center
      items-center
      flex-col
      mt-2
      relative
      "
      >
        <div id="container" className="w-full" ref={wrapperRef}></div>
      </div>
    </>
  );
};

export default QuillEditor;
