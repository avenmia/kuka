import React from 'react';
import { Box, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import Page from 'src/components/Page';
import ReactPlayer from "react-player";
import { useParams } from "react-router";
import { agendaRef } from "../../../services/AgendaItem";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { testimonyRef } from "../../../services/Testimony";
import type { Agenda } from "../../../types/agenda";
import type { Testimony } from "../../../types/testimony";


const useStyles = makeStyles(() => ({
  root: {},
  reactPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  playerWrapper: {
    position: 'relative',
    paddingTop: '56.25%' /* Player ratio: 100 / (1280 / 720) */
  }
}));

function TestimonyDetailView() {
  const classes = useStyles();
  const { agendaId, testimonyId} = useParams();

  const [agendaItem, agendaLoading, agendaError] = useDocumentDataOnce<Agenda>(
    agendaRef.doc(agendaId)
  )
  const [testimony, testimonyLoading, testimonyError] = useDocumentDataOnce<Testimony>(
    testimonyRef.doc(testimonyId)
  )

  return (
    <Page
      className={classes.root}
      title="Home"
    >
      <Container maxWidth="lg">
        { agendaItem && (
          <Box mt={6} mb={3}>
            <Typography variant="h2">
              {agendaItem.title}
            </Typography>
          </Box>
        )}
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            md={9}
          >
            {agendaItem && testimony && (
              <div className={classes.playerWrapper}>
                <ReactPlayer
                  className={classes.reactPlayer}
                  controls
                  height={"100%"}
                  url={testimony.embedUrl}
                  width={"100%"}
                />
              </div>
            )}
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
          >
            Testimony list here
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

export default TestimonyDetailView;
