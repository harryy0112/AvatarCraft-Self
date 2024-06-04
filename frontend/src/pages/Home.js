import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import StyleSelector from "../components/StyleSelector.js";
import Backdrop from "@material-ui/core/Backdrop";
import DownloadIcon from "@material-ui/icons/GetApp";

import ImageUploader from "react-images-upload";
import ReactCompareImage from "react-compare-image";
import * as loadImage from "blueimp-load-image";

import GridLoader from "react-spinners/GridLoader";
import beforePlaceholder from "../images/before.jpg";
import afterPlaceholder from "../images/after.jpg";
import logo from "../images/logo.svg";

import { triggerBase64Download } from "react-base64-downloader";
import { transform } from "../api.js";
import { toDataUrl } from "../utils.js";

const LOAD_SIZE = 450;
const WIDTH = 400;

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "70%",
    margin: theme.spacing(1),
  },
  holder: {
    width: WIDTH,
    maxWidth: 400,
    margin: 10,
  },
  chip: {
    width: 200,
    backgroundColor: "#e63946",
    margin: 10,
    fontWeight: "bold",
  },
  logo: {
    width: WIDTH * 0.8,
    marginTop: 20,
    marginLeft: 0,
  },
}));

export default function Home() {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [percentage, setPercentage] = useState(0.5);
  const [modelID, setModelID] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load placeholder images
    toDataUrl(beforePlaceholder, (base64) => {
      setBefore(base64);
    });
    toDataUrl(afterPlaceholder, (base64) => {
      setAfter(base64);
    });
  }, []);

  const classes = useStyles();

  const handleImageChange = (pictureFiles, pictureDataURL) => {
    setOpen(true);
    setPercentage(1);
    setLoading(true);

    loadImage(
      pictureDataURL[0],
      (cnv) => {
        const imageData = cnv.toDataURL();
        setBefore(imageData);
        setAfter(imageData);

        const data = {
          image: imageData,
          model_id: modelID,
          load_size: LOAD_SIZE,
        };
        transform(data)
          .then((response) => {
            console.log("Success:", response.data);
            setAfter(response.data.output);
            setPercentage(0.0);
          })
          .catch((error) => {
            console.error("Error transforming image:", error);
            // You might want to add UI feedback or more detailed error handling here
          })
          .finally(() => {
            setLoading(false);
            setOpen(false);
          });
      },
      {
        orientation: true,
        canvas: true,
        crossOrigin: "anonymous",
        maxWidth: 600,
      }
    );
  };

  return (
    <Box align="center">
      <div style={{ textAlign: "center", width: "100%" }}>
        <img src={logo} className={classes.logo} alt="Logo" />
      </div>
      <div className={classes.holder}>
        <StyleSelector
          modelID={modelID}
          setModelID={setModelID}
          setPercentage={setPercentage}
          setOpen={setOpen}
          before={before}
          LOAD_SIZE={LOAD_SIZE}
          setAfter={setAfter}
        />

        <ImageUploader
          singleImage
          buttonText="Choose images"
          onChange={handleImageChange}
          imgExtension={[".jpg", ".png", "jpeg", ".gif"]} // Removed duplicate ".gif"
          maxFileSize={5242880}
        />

        <ReactCompareImage
          aspectRatio="wider"
          leftImage={before}
          rightImage={after}
          leftImageLabel="Before"
          rightImageLabel="After"
          sliderPositionPercentage={percentage}
          sliderLineColor="black"
          leftImageCss={{ borderRadius: 10 }}
          rightImageCss={{ borderRadius: 10 }}
        />

        <Chip
          color="secondary"
          label="Download"
          className={classes.chip}
          icon={<DownloadIcon style={{ marginTop: 4 }} />}
          onClick={() => {
            triggerBase64Download(after, "styled_image");
          }}
        />
      </div>
      <Backdrop
        open={open || loading}
        style={{ zIndex: 999 }}
        onClick={() => {
          setOpen(false);
        }}
      >
        <GridLoader size={30} margin={2} color="#e63946" />
      </Backdrop>
    </Box>
  );
}
