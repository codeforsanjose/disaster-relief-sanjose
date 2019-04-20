import React, { useState } from "react";

import DisasterPostDetails from "../DisasterPostDetails/DisasterPostDetails";
import DisasterModalPostDetails from "../DisasterModalPostDetails/DisasterModalPostDetails";

import "./DisasterPosts.css";

function DisasterPosts(props) {
  const defaultState = {
    showModal: false,
    selectedPost: null
  };
  const [state, setState] = useState(defaultState);

  const openPostModal = post => {
    setState(previousState => {
      return {
        ...previousState,
        showModal: true,
        selectedPost: post
      };
    });
  };

  const postsMockup = (posts, openPostModal) => {
    return posts
      ? posts.map((post, index) => {
          return (
            <DisasterPostDetails
              key={`post-${index}`}
              post={post}
              openPostModal={openPostModal}
            />
          );
        })
      : null;
  };

  const dismissModal = e => {
    e.preventDefault();
    setState(prevState => {
      return {
        ...prevState,
        showModal: false,
        selectedPost: null
      };
    });
  };

  const getModalDetails = () => {
    return (
      <DisasterModalPostDetails
        selectedPost={state.selectedPost}
        handleSelectPost={props.handleSelectPost}
        dismissModal={props.dismissModal}
      />
    );
  };

  const modalDetails = state.showModal ? getModalDetails() : null;
  const backdrop = state.showModal ? (
    <div className="backdrop" onClick={dismissModal} />
  ) : null;
  const posts = postsMockup(props.posts, openPostModal);
  return (
    <div className="DisasterPosts">
      {backdrop}
      {modalDetails}
      <section className="posts-list-container">{posts}</section>
    </div>
  );
}

export default DisasterPosts;
