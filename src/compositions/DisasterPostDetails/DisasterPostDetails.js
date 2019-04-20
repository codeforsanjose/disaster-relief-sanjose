import React from "react";
import { Map } from "react-feather";

import {
  AddressMarkup,
  ContactMarkup,
  InformationMarkup
} from "../PostMarkup/PostMarkup";

export default function DisasterPostDetails(props) {
  const post = props.post;
  // const { title } = post;
  const markup = <ContactMarkup details={post} />;
  const contactDetails = <aside className="contact-details">{markup}</aside>;

  const addressDetails = <AddressMarkup details={post} />;
  const postInfoMarkup = <InformationMarkup details={post} />;
  return (
    <div className="post-details" onClick={e => props.openPostModal(post)}>
      <aside className="map">
        <Map size={100} />

        {addressDetails}
      </aside>
      <section className="disaster-details">{postInfoMarkup}</section>
      {contactDetails}
    </div>
  );
}
