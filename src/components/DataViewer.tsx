import React from 'react';
import { MessageCircle, ThumbsUp, Users, Calendar, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../store';
import { ProcessedPost } from '../utils/preprocessData';
import { FileUpload } from './FileUpload';

export function DataViewer() {
  const { setSelectedPost, selectedPost, data } = useStore();

  const renderPostCard = (post: ProcessedPost) => (
    <div
      key={post.Message_URL}
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        selectedPost?.Message_URL === post.Message_URL
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => setSelectedPost(post)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{post.Profile}</h3>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {post.Network}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{post.formattedDate}</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.Message}</p>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{Number(post.Followers).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{Number(post.Engagements).toLocaleString()}</span>
          </div>
        </div>
        <a 
          href={post.Message_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <FileUpload />
      
      <div className="h-[calc(100vh-24rem)] overflow-y-auto space-y-4 scrollbar-hide">
        {data.length === 0 ? (
          <div className="text-gray-500 text-center p-4">
            Upload a CSV file to view social media data
          </div>
        ) : (
          data.map(renderPostCard)
        )}
      </div>
    </div>
  );
}