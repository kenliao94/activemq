import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Warning, ErrorOutline, Info, HelpOutline } from '@mui/icons-material';

export interface ConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Dialog title
   */
  title: string;
  /**
   * Dialog message/description
   */
  message: string;
  /**
   * Confirm button text
   */
  confirmText?: string;
  /**
   * Cancel button text
   */
  cancelText?: string;
  /**
   * Severity level affects icon and button color
   */
  severity?: 'warning' | 'error' | 'info' | 'question';
  /**
   * Whether the action is destructive (affects button color)
   */
  destructive?: boolean;
  /**
   * Callback when confirmed
   */
  onConfirm: () => void;
  /**
   * Callback when cancelled
   */
  onCancel: () => void;
  /**
   * Whether the confirm action is loading
   */
  loading?: boolean;
  /**
   * Additional details to display
   */
  details?: string;
}

/**
 * Confirmation dialog for destructive or important actions
 * Provides clear feedback and prevents accidental actions
 * Meets WCAG 2.1 AA accessibility standards
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  destructive = false,
  onConfirm,
  onCancel,
  loading = false,
  details,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorOutline sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 48, color: 'warning.main' }} />;
      case 'info':
        return <Info sx={{ fontSize: 48, color: 'info.main' }} />;
      case 'question':
        return <HelpOutline sx={{ fontSize: 48, color: 'primary.main' }} />;
      default:
        return <Warning sx={{ fontSize: 48, color: 'warning.main' }} />;
    }
  };

  const getButtonColor = () => {
    if (destructive) {
      return 'error';
    }
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
        {details && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              borderLeft: 3,
              borderColor: `${getButtonColor()}.main`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {details}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          aria-label={cancelText}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={getButtonColor()}
          autoFocus
          aria-label={confirmText}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Hook to manage confirm dialog state
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'warning' | 'error' | 'info' | 'question';
    destructive?: boolean;
    details?: string;
    onConfirm?: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const [loading, setLoading] = React.useState(false);

  const showConfirm = React.useCallback(
    (options: Omit<typeof dialogState, 'open'>) => {
      setDialogState({
        ...options,
        open: true,
      });
    },
    []
  );

  const handleConfirm = React.useCallback(async () => {
    if (dialogState.onConfirm) {
      setLoading(true);
      try {
        await dialogState.onConfirm();
        setDialogState((prev) => ({ ...prev, open: false }));
      } catch (error) {
        console.error('Confirm action failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setDialogState((prev) => ({ ...prev, open: false }));
    }
  }, [dialogState.onConfirm]);

  const handleCancel = React.useCallback(() => {
    if (!loading) {
      setDialogState((prev) => ({ ...prev, open: false }));
    }
  }, [loading]);

  const ConfirmDialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        severity={dialogState.severity}
        destructive={dialogState.destructive}
        details={dialogState.details}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
      />
    ),
    [dialogState, handleConfirm, handleCancel, loading]
  );

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
