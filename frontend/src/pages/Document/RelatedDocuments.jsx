import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRelatedDocuments } from "../../services/documentService";

const RelatedDocuments = ({ currentDoc }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const docs = await fetchRelatedDocuments(
          currentDoc.educationLevel,
          currentDoc.subject,
          currentDoc._id
        );
        setRelated(docs);
      } catch (error) {
        console.error("Error fetching related documents:", error);
        setRelated([]);
      }
    };
    fetchRelated();
  }, [currentDoc]);

  return (
    <div className="related-docs">
      <h3>Tài liệu liên quan</h3>
      <ul>
        {related.map((doc) => (
          <li key={doc._id}>
            <Link to={`/documents/detail/${doc._id}`}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedDocuments;