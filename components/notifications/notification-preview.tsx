"use client"

interface NotificationPreviewProps {
  title: string
  message: string
}

export function NotificationPreview({ title, message }: NotificationPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Notification Preview</h3>

      {title.trim() || message.trim() ? (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex gap-3">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 break-words line-clamp-1">{title || "Notification Title"}</p>
              <p
                className="text-xs text-gray-600 break-words mt-1 line-clamp-2"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {message || "Notification content will appear here"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-4 border border-dashed border-muted-foreground/30 text-center">
          <p className="text-xs text-muted-foreground">Start typing to see your notification preview</p>
        </div>
      )}
    </div>
  )
}
